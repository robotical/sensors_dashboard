const RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE = "VCNL4200";
const RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT = "lightsensor";
const RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR = "coloursensor";
const RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT = "IRFoot";
const RIC_WHOAMI_TYPE_CODE_ADDON_NOISE = "noisesensor";


const whoAmInamesMap = {
    [RIC_WHOAMI_TYPE_CODE_ADDON_DISTANCE]: "Distance Sensor",
    [RIC_WHOAMI_TYPE_CODE_ADDON_LIGHT]: "Light Sensor",
    [RIC_WHOAMI_TYPE_CODE_ADDON_COLOUR]: "Color Sensor",
    [RIC_WHOAMI_TYPE_CODE_ADDON_IRFOOT]: "Obstacle Sensor",
    [RIC_WHOAMI_TYPE_CODE_ADDON_NOISE]: "Noise Sensor",

    coloursensor0: "Color Sensor 0",
    coloursensor1: "Color Sensor 1",

    lightsensor0: "Light Sensor 0",
    lightsensor1: "Light Sensor 1",

    noisesensor0: "Noise Sensor 0",
    noisesensor1: "Noise Sensor 1",

    IRFoot0: "Obstacle Sensor 0",
    IRFoot1: "Obstacle Sensor 1",

    distance0: "Distance Sensor 0",
    distance1: "Distance Sensor 1",
};

export default function whoAmINameMap (defaultName: string) {
    // if there are 0 or more than 1 instances of the defaultName in the map, return the defaultName
    if (Object.keys(whoAmInamesMap).filter((name) => name === defaultName).length !== 1) return defaultName;
    return whoAmInamesMap[defaultName as keyof typeof whoAmInamesMap] || defaultName;
}

