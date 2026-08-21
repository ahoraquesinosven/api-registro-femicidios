import assert from "node:assert/strict";
import { test } from "node:test";
import { dedupeFeedItems } from "../../src/data/feedItem.js";

// dedupeFeedItems() filters a single refresh batch down to one item per
// (normalized title, link domain) pair, keeping the first occurrence.
const item = (overrides = {}) => ({
  title: "Some title",
  link: "https://news.example/article-1",
  ...overrides,
});

test("drops a later item whose title normalizes the same on the same domain", () => {
  const first = item({
    title:
      "Micaela Albornoz: continúa desaparecida y su familia vuelve a movilizarse | El Ciudadano",
    link: "https://elciudadanoweb.com/micaela-albornoz-continua-desaparecida-y-su-familia-vuelve-a-movilizarse/",
  });
  const second = item({
    title:
      "Micaela Albornoz: continúa desaparecida y su familia vuelve a movilizarse - El Ciudadano",
    link: "https://elciudadanoweb.com/micaela-albornoz-continua-desaparecida-y-su-familia-vuelve-a-movilizarse/amp/",
  });
  const third = item({
    title:
      "Micaela Albornoz compró pasajes con el DNI de una vecina y la buscan en Santiago del Estero",
    link: "https://www.lacapital.com.ar/policiales/micaela-albornoz-compro-pasajes-el-dni-una-vecina-y-la-buscan-santiago-del-estero-n10271904.html",
  });
  const forth = item({
    title: "Escapó desnuda por la ventana - Diario La Opinión de Rafaela",
    link: "https://diariolaopinion.com.ar/amp/escapo-desnuda-por-la-ventana.htm",
  });
  const fifth = item({
    title: "Escapó desnuda por la ventana | Diario La Opinión de Rafaela",
    link: "https://diariolaopinion.com.ar/policiales/escapo-desnuda-por-la-ventana.htm",
  });

  assert.deepEqual(dedupeFeedItems([first, second, third, forth, fifth]), [
    first,
    third,
    forth,
  ]);
});

test("keeps same-title items when the link domain differs", () => {
  const oneDomain = item({
    title: "Femicidio en - Rosario",
    link: "https://news-one.example/a",
  });
  const otherDomain = item({
    title: "Femicidio en | Rosario",
    link: "https://news-two.example/b",
  });

  assert.deepEqual(dedupeFeedItems([oneDomain, otherDomain]), [
    oneDomain,
    otherDomain,
  ]);
});

test("keeps distinct titles on the same domain", () => {
  const rosario = item({
    title: "Femicidio en Rosario",
    link: "https://news.example/a",
  });
  const cordoba = item({
    title: "Femicidio en Cordoba",
    link: "https://news.example/b",
  });

  assert.deepEqual(dedupeFeedItems([rosario, cordoba]), [rosario, cordoba]);
});

test("buckets unparseable links together, as a null domain, when titles match", () => {
  const first = item({ title: "Femicidio en Rosario", link: "not-a-url" });
  const second = item({
    title: "Femicidio en Rosario",
    link: "also-not-a-url",
  });

  assert.deepEqual(dedupeFeedItems([first, second]), [first]);
});

test("no-ops on an empty batch", () => {
  assert.deepEqual(dedupeFeedItems([]), []);
});
