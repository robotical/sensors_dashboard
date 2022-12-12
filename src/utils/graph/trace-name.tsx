export const motorPosDifferentiation = (traceName: string): string => {
    const traceNameArr = traceName.split("=>");
    return traceNameArr[0] === "Motor Position" ? "Postion " + traceName.split("=>")[1] : traceName.split("=>")[1];
}

export const rgbColorTraceName = (traceName: string): string | "" => {
    if (traceName === "Red" || traceName === "Blue" || traceName === "Green") 
        return traceName.toLocaleLowerCase();
    return "";
}