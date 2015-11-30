export default class AbstractParser {
  parse(response) {
    return {};
  }

  parseLine(l) {
    var i = l.indexOf(':'),
        key = l.slice(0, i).toLowerCase().trim(),
        value = (l.slice(i + 1) || '').trim();

    return {
      key: key,
      value: value
    };
  }
}
