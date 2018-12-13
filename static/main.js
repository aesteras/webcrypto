const worker = new Worker('worker.js');

worker.onmessage = event => {
  document.getElementById('encrypted').value = event.data.encrypted;
  document.getElementById('decrypted').value = event.data.decrypted;
};

const encode = d => new TextEncoder('utf-8').encode(d);

const decode = e => new TextDecoder('utf-8').decode(e);

const encrypt = () => {
  let decrypted = document.getElementById('decrypted').value;
  // decrypted = Encoding.UTF8.GetBytes(decrypted);
  // worker.postMessage(decrypted, [decrypted]);
  console.log(decrypted);
  console.log(encode(decrypted));
  console.log(decode(encode(decrypted)));
}

const decrypt = () => {
  let encrypted = document.getElementById('encrypted').value;
  console.log('called decrypt')
}
