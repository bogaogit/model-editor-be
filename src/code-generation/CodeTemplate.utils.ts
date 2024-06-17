
export function cc(
  inputString: string,
): string {
  if (inputString){
    return lf(pc(inputString));
  } else {
    return "";
  }
}

export function pc(
  inputString: string,
): string {
  if (inputString){
    return inputString
      .match(/[a-z,0-9]+/gi)
      .map(function (word) {
        return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
      })
      .join("");
  } else {
    return "";
  }
}

export function kc(
  inputString: string,
): string {
  if (inputString){
    return inputString
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  } else {
    return "";
  }
}

export function lf(
  inputString: string,
): string {
  if (inputString){
    return inputString.charAt(0).toLowerCase() + inputString.slice(1);
  } else {
    return "";
  }
}

