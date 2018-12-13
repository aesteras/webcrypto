const worker = new Worker('worker.js');
const encode = d => new TextEncoder('utf-8').encode(d);
const decode = e => new TextDecoder('utf-8').decode(e);

worker.onmessage = event => {
  document.getElementById('encrypted').value = decode(event.data.encryptedMessage);
  document.getElementById('decrypted').value = decode(event.data.decryptedMessage);
};

const post = dataObject => worker.postMessage(dataObject,
  [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);

const encrypt = () => {
  const dataObject = {
    encryptedMessage: encode(document.getElementById('decrypted').value),
    decryptedMessage: new Uint8Array([]),
    passwordAsBytes: encode(prompt('Enter your password:'))
  };
  post(dataObject);
}

const decrypt = () => {
  const dataObject = {
    encryptedMessage: new Uint8Array([]),
    decryptedMessage: encode(document.getElementById('encrypted').value),
    passwordAsBytes: encode(prompt('Enter your password:'))
  };
  post(dataObject);
}