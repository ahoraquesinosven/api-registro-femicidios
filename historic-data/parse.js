export function parseBoolean(value) {
    if (!value || value.trim() === "" || value.trim() === "Sin Datos") return undefined;
    return value.trim().toLowerCase().startsWith("si");
}

export function parseInteger(value) {
    if (!value || value.trim() === "") return undefined;
    const parsed = parseInt(value.trim(), 10);
    return isNaN(parsed) ? undefined : parsed;
}

export function parseDecimal(value) {
    if (!value || value.trim() === "") return undefined;
    const parsed = parseFloat(value.trim().replace(",", "."));
    return isNaN(parsed) ? undefined : parsed;
}

export function parseOptionalString(value) {
    if (!value || value.trim() === "") return undefined;
    return value.trim();
}

export function parseGender(value) {
    const map = {
        "Mujer": "MUJER",
        "Hombre": "HOMBRE",
        "No binario": "NO_BINARIO",
        "Trans": "TRANS",
        "Travesti": "TRAVESTI",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid gender value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseNationality(value) {
    if (!value || value.trim() === "") return undefined;
    if (value.trim().toLowerCase().startsWith("otros pais")) return "OTRA";
    return value.trim();
}

export function parseMomentOfDay(value) {
    const map = {
        "Diurno": "DIURNO",
        "Nocturno": "NOCTURNO",
    };

    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid moment of day value ${trimmedValue}`);
    return map[value.trim()];
}

export function parseProvince(value) {
    const map = {
        "Buenos Aires": "BUENOS_AIRES",
        "Catamarca": "CATAMARCA",
        "Chaco": "CHACO",
        "Chubut": "CHUBUT",
        "Ciudad Autónoma de Buenos Aires": "CABA",
        "Córdoba": "CORDOBA",
        "Corrientes": "CORRIENTES",
        "Entre Ríos": "ENTRE_RIOS",
        "Formosa": "FORMOSA",
        "Jujuy": "JUJUY",
        "La Pampa": "LA_PAMPA",
        "La Rioja": "LA_RIOJA",
        "Mendoza": "MENDOZA",
        "Misiones": "MISIONES",
        "Neuquén": "NEUQUEN",
        "Río Negro": "RIO_NEGRO",
        "Salta": "SALTA",
        "San Juan": "SAN_JUAN",
        "San Luis": "SAN_LUIS",
        "Santa Cruz": "SANTA_CRUZ",
        "Santa Fe": "SANTA_FE",
        "Santiago del Estero": "SANTIAGO_DEL_ESTERO",
        "Tierra del Fuego": "TIERRA_DEL_FUEGO",
        "Tucumán": "TUCUMAN",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid province value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseGeographicLocation(value) {
    const map = {
        "Urbana": "URBANA",
        "Rural": "RURAL",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid geographic location value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parsePlace(value) {
    const map = {
        "Vivienda de la Victima": "VIVIENDA_DE_LA_VICTIMA",
        "Vivienda del Agresor": "VIVIENDA_DEL_AGRESOR",
        "Via Publica": "VIA_PUBLICA",
        "Vivienda de algun Familiar": "VIVIENDA_DE_ALGUN_FAMILIAR",
        "Vivienda de ambas partes (convivían)": "VIVIENDA_DE_AMBAS_PARTES_CONVIVIAN",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return "OTRO_LUGAR";
    if (trimmedValue.toLowerCase().startsWith("otro")) return "OTRO_LUGAR";
    if (!trimmedValue in map) throw new Error(`Invalid place value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseMurderWeapon(value) {
    const map = {
        "A Golpes": "A_GOLPES",
        "Arma Blanca": "ARMA_BLANCA",
        "Arma de Fuego": "ARMA_DE_FUEGO",
        "Arrojada por el balcón": "ARROJADA_POR_EL_BALCON",
        "Asfixia": "ASFIXIA",
        "Atropellada": "ATROPELLADA",
        "Empujo por las escaleras": "EMPUJO_POR_LAS_ESCALERAS",
        "Quemada / Calcinada": "QUEMADA_CALCINADA",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (trimmedValue.toLowerCase().startsWith("otro")) return "OTRA_FORMA";
    if (!trimmedValue in map) throw new Error(`Invalid murder weapon value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseCaseCategory(value) {
    const map = {
        "Femicidio Directo": "FEMICIDIO_DIRECTO",
        "Intento de Femicidio": "FEMICIDIO_DIRECTO",
        "Se Investiga - Femicidio": "FEMICIDIO_DIRECTO",
        "Femicidio Vinculado": "FEMICIDIO_VINCULADO",
        "Intento de Femicidio Vinculado": "FEMICIDIO_VINCULADO",
        "Transfemicidio": "TRANSFEMICIDIO",
        "Travesticidio/Transfemicidio": "TRAVESTICIDIO",
        "Intento de Travesticidio/Transfemicidio": "TRAVESTICIDIO",
        "Crímenes de Odio": "CRIMEN_DE_ODIO",
        "Instigación al suicidio": "INSTIGACION_AL_SUICIDIO",
        "Intento de Transfemicidio": "TRANSFEMICIDIO",
        "Travesticidio": "TRAVESTICIDIO",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid case category value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseVictimBondAggressor(value) {
    const map = {
        "Pareja actual": "PAREJA_ACTUAL",
        "Ex Pareja": "EX_PAREJA",
        "Familiar-Madre": "FAMILIAR_MADRE",
        "Familiar-Hija": "FAMILIAR_HIJA",
        "Familiar-Hijo": "FAMILIAR_HIJO",
        "Familiar-Hermano": "FAMILIAR_HERMANO",
        "Familiar-Nieto": "FAMILIAR_NIETO",
        "Familiar-Padre": "FAMILIAR_PADRE",
        "Familiar-Sobrina": "FAMILIAR_SOBRINA",
        "Familiar-Suegra": "FAMILIAR_SUEGRA",
        "Familiar-Suegro": "FAMILIAR_SUEGRO",
        "Familiar-Cuñado/Cuñada": "FAMILIAR_CUÑADO",
        "Conocido (No familiar)": "CONOCIDO_NO_FAMILIAR",
        "Desconocido": "DESCONOCIDO",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid victim bond aggressor value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseDate(value) {
    if (!value || value.trim() === "") return undefined;
    const [day, month, year] = value.trim().split("/");
    if (!day || !month || !year) return undefined;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function parseNewsLinks(row) {
    return [row.newsLink_1, row.newsLink_2]
        .filter(Boolean)
        .flatMap(cell => cell.split(/[\s,]+/))
        .map(s => s.trim())
        .filter(s => s.startsWith("http"));
}

export function parseBehaviourPostCase(value) {
    const map = {
        "Se suicido": "SE_SUICIDO",
        "Intento suicidarse": "INTENTO_SUICIDARSE",
        "Ocultó su autoría": "OCULTO_SU_AUTORIA",
        "Se fugó": "SE_FUGO",
        "Intento escaparse": "INTENTO_ESCAPARSE",
        "Se entregó/confesó": "SE_ENTREGO_CONFESO",
        "Se deshizo del cuerpo": "SE_DESHIZO_DEL_CUERPO",
        "Pidió ayuda/asistió a la víctima": "PIDIO_AYUDA_ASISTIO_A_LA_VICTIMA",
        "Se resistió a la autoridad": "SE_RESISTIO_A_LA_AUTORIDAD",
        "Ninguna de las anteriores": "NINGUNA_DE_LAS_ANTERIORES",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid behaviour post case value ${trimmedValue}`);
    return map[trimmedValue];
}

export function parseSecurityForce(value) {
    const map = {
        "Policia": "POLICIA",
        "Militares": "MILITAR",
        "Ex teniente de Infantería del Ejército": "MILITAR",
    };
    const trimmedValue = value && value.trim();
    if (!trimmedValue || trimmedValue === "" || trimmedValue.toLowerCase() === "sin datos") return undefined;
    if (!trimmedValue in map) throw new Error(`Invalid security force value ${trimmedValue}`);
    return map[trimmedValue];
}
