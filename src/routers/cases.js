import Router from "@koa/router";
import knex from "../services/knex.js";

const router = new Router({
  prefix: '/v1/cases',
});

const mockData = [
  {
    id: 1,
    categoria: "femicidio",
    nombre_victima: "Agustina",
    nombre_agresor: "Leandro",
    ubicacion: "Santa Fe",
    fecha: "2023-04-23T15:00:00.000Z"
  },
  {
    id: 2,
    categoria: "intento_femicidio",
    nombre_victima: "Nicole",
    nombre_agresor: "Jeremias",
    ubicacion: "Formosa",
    fecha: "2022-11-11T16:23:45.000Z"
  },
  {
    id: 3,
    categoria: "investiga_femicidio",
    nombre_victima: "Victoria",
    nombre_agresor: "Nicolas",
    ubicacion: "Tierra del fuego",
    fecha: "2020-09-23T23:30:30.000Z"
  },
  {
    id: 4,
    categoria: "transfemicidio",
    nombre_victima: "Naiara",
    nombre_agresor: "Jose Luis",
    ubicacion: "Mendoza",
    fecha: "2024-01-23T23:30:30.000Z"
  },
  {
    id: 5,
    categoria: "intento_femicidio_vinculado",
    nombre_victima: "Camila",
    nombre_agresor: "Jorge",
    ubicacion: "Buenos Aires",
    fecha: "2017-06-11T23:30:30.000Z"
  },
];

router.get(
  "/",
  async (ctx) => {
    ctx.body = mockData;
  }
);

export default router;
