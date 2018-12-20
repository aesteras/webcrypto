const worker = new Worker('worker.js');

const UTF8 = {
  encode: d => new TextEncoder('utf-8').encode(d),
  decode: e => new TextDecoder('utf-8').decode(e)
};

const encrypt = () => {
  const dataObject = {
    function: 'encrypt',
    encryptedMessage: new Uint8Array(),
    decryptedMessage: UTF8.encode(document.getElementById('decrypted').value),
    passwordAsBytes: UTF8.encode(prompt('Enter your password:'))
  };
  worker.postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
}

const decrypt = () => {
  const dataObject = {
    function: 'decrypt',
    encryptedMessage: UTF8.encode(document.getElementById('encrypted').value),
    decryptedMessage: new Uint8Array(),
    passwordAsBytes: UTF8.encode(prompt('Enter your password:'))
  };
  worker.postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
}

worker.onmessage = event => {
  document.getElementById('encrypted').value = UTF8.decode(event.data.encryptedMessage);
  document.getElementById('decrypted').value = UTF8.decode(event.data.decryptedMessage);
};