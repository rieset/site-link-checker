import { checking } from './common';

const [ node, script, url ] = process.argv
checking(url, {
  depth: 4
})
.then((contracts) => {
  console.log(contracts)
})
.catch((error) => {
  console.error('Unexpected error', error);
})
