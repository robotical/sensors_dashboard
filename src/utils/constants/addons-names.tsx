
const MAP = {
    "Touch_IR": "Obstacle Sensor",
    "Touch": "Obstacle Detected?",
    "Touch_Ambient": "Ambient IR - Front",
    "Air_IR": "Ground Sensor",
    "Air": "Foot In Air?",
    "Air Ambient": "Ambient IR - Bottom",
    "Air_Ambient": "Ambient IR - Bottom",

    "Clear": "Brightness",
    "Red": "Red Channel",
    "Green": "Green Channel",
    "Blue": "Blue Channel",
    "IRVal": "Obstacle Sensor",

    "Smoothed": "Recent Noise Level",
    "HighestSinceLastReading": "Noise level",
    "Raw": "Instant Noise Level",
    
    "Reading1": "Light Level - Right",
    "Reading2": "Light Level - Center",
    "Reading3": "Light Level - Left"
 };
 

export default function addonNamesMap (defaultName: string) {
    // if there are 0 or more than 1 instances of the defaultName in the map, return the defaultName
    if (Object.keys(MAP).filter((name) => name === defaultName).length !== 1) return defaultName;
    return MAP[defaultName as keyof typeof MAP] || defaultName;
}

