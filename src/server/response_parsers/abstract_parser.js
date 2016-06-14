export default class AbstractParser {
  parse() {
    return {};
  }

  parseLine(l) {
    const i = l.indexOf(':');
    const key = l.slice(0, i).toLowerCase().trim();
    const value = (l.slice(i + 1) || '').trim();

    return {
      key: key,
      value: value
    };
  }
}
