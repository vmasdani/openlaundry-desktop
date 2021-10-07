import Pako from "pako";

export const dbzEncode = (content: string) => {
  try {
    return btoa(
      String.fromCharCode.apply(
        null,
        Pako.gzip(new TextEncoder().encode(content))
      )
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const dbzDecode = (content: string) => {
  try {
    return new TextDecoder().decode(
      Pako.ungzip(Uint8Array.from(atob(content), (c) => c.charCodeAt(0)))
    );
  } catch (e) {
    console.error(e);
    return null;
  }
};
