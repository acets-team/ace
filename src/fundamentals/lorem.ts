/**
 * 🧚‍♀️ How to access:
 *     - import { loremWords, loremParagraphs } from '@ace/lorem'
 */


/**
 * - Get lorem ipsum text by choosing how many words you'd love in the response
 * @param count The number of words you'd love in the response. `1 paragraph = 92`, `2 paragraphs = 158`, `3 paragraphs = 210`. Any number between 0 and 210 is valid!
 * @returns string lorem text w/ paragraphs united via `<br><br>`
 */
export function loremWords(count: number) {
  if (typeof count !== 'number' || count <= 0) count = p1Length;
  else if (count > totalLength) count = totalLength;

  let res: string;

  if (count <= p1Length) res = getParagraph(0, count)
  else if (count <= p1Length + p2Length) {
    const p1 = getParagraph(0, p1Length)
    const p2 = getParagraph(p1Length, count)
    res = p1 + space + p2
  } else {
    const p1 = getParagraph(0, p1Length)
    const p2 = getParagraph(p1Length, p1Length + p2Length)
    const p3 = getParagraph(p1Length + p2Length, count)
    res = p1 + space + p2 + space + p3
  }

  return res;
}


/**
 * - Get lorem ipsum text by choosing how many paragraphs you'd love in the response
 * @param count The number of paragraphs you'd love in the response, max supported `count` is 3, defaults `count` to 1 if not 1, 2 or 3
 * @returns string lorem text w/ paragraphs united via `<br><br>`
 */
export function loremParagraphs(count?: 1 | 2 | 3) {
  if (count !== 1 && count !== 2 && count !== 3) count = 1

  switch (count) {
    case 1: return getParagraph(0, p1Length)
    case 2: return getParagraph(0, p1Length) + space + getParagraph(p1Length, p1Length + p2Length)
    case 3: return getParagraph(0, p1Length) + space + getParagraph(p1Length, p1Length + p2Length) + space + getParagraph(p1Length + p2Length, totalLength)
  }
}


function getParagraph(startIndex: number, endIndex: number) {
  return words.slice(startIndex, endIndex).join(' ')
}


const space = '<br><br>'
const p1Length = 92
const p2Length = 66
const p3Length = 52
const totalLength = p1Length + p2Length + p3Length
const words = [ 'Lorem', 'ipsum', 'dolor', 'sit', 'amet,', 'consectetur', 'adipiscing', 'elit.', 'Morbi', 'sit', 'amet', 'lacus', 'vel', 'purus', 'sodales', 'rhoncus.', 'Aliquam', 'erat', 'volutpat.', 'Donec', 'at', 'vehicula', 'sapien.', 'Ut', 'sed', 'pretium', 'enim.', 'Sed', 'quis', 'imperdiet', 'mi.', 'Pellentesque', 'eleifend', 'imperdiet', 'nulla', 'in', 'semper.', 'Aenean', 'dolor', 'tortor,', 'mollis', 'ac', 'ligula', 'et,', 'varius', 'volutpat', 'nisi.', 'Suspendisse', 'id', 'porta', 'purus.', 'Nulla', 'pharetra', 'et', 'elit', 'ac', 'malesuada.', 'In', 'vehicula', 'turpis', 'tristique', 'neque', 'iaculis', 'commodo.', 'Nunc', 'molestie', 'in', 'urna', 'nec', 'aliquam.', 'Sed', 'vel', 'lectus', 'sit', 'amet', 'metus', 'elementum', 'convallis.', 'Pellentesque', 'convallis', 'quam', 'sed', 'arcu', 'vestibulum,', 'posuere', 'eleifend', 'nisl', 'tempus.', 'Sed', 'eget', 'mi', 'tellus.', 'Donec', 'ultricies', 'mi', 'at', 'laoreet', 'bibendum.', 'Suspendisse', 'potenti.', 'Sed', 'pulvinar', 'ex', 'non', 'mi', 'finibus', 'varius.', 'Praesent', 'consequat', 'metus', 'vel', 'dictum', 'pretium.', 'Aenean', 'sed', 'nibh', 'turpis.', 'Morbi', 'lorem', 'diam,', 'luctus', 'quis', 'elit', 'at,', 'eleifend', 'pellentesque', 'sapien.', 'Vestibulum', 'ac', 'posuere', 'leo,', 'in', 'consequat', 'lacus.', 'Donec', 'hendrerit', 'id', 'ex', 'sed', 'ultricies.', 'Maecenas', 'at', 'efficitur', 'mi.', 'Proin', 'hendrerit', 'pellentesque', 'rhoncus.', 'In', 'libero', 'dui,', 'hendrerit', 'gravida', 'magna', 'rutrum,', 'viverra', 'interdum', 'urna.', 'Pellentesque', 'interdum', 'vehicula', 'vestibulum.', 'Aenean', 'imperdiet', 'facilisis', 'tellus,', 'lobortis', 'mattis', 'urna', 'porttitor', 'finibus.', 'Integer', 'ut', 'diam', 'porttitor,', 'pulvinar', 'nisi', 'vitae,', 'varius', 'sem.', 'Sed', 'bibendum', 'interdum', 'justo', 'nec', 'consequat.', 'Donec', 'vel', 'arcu', 'sit', 'amet', 'neque', 'consectetur', 'scelerisque.', 'Aenean', 'euismod', 'sollicitudin', 'libero,', 'ac', 'hendrerit', 'nisl.', 'Phasellus', 'dapibus', 'nunc', 'orci,', 'ut', 'iaculis', 'arcu', 'sollicitudin', 'vitae.' ]
