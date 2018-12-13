const ITERATIONS = 250000;

const encode = d => new TextEncoder('utf-8').encode(d);
const decode = e => new TextDecoder('utf-8').decode(e);

const workerEncrypt = (dataAsBytes, passwordAsBytes) => {
  self.crypto.subtle.importKey(
    'raw',
    passwordAsBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  .then(passwordKey => {
    const salt = self.crypto.getRandomValues(new Uint8Array(32));
    return self.crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  })
  .then(aesKey => {
    const iv = self.crypto.getRandomValues(new Uint8Array(12));
    return self.crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, dataAsBytes);
  })
  .then(encryptedContent => {
    const encryptedBytes = new Uint8Array(encryptedContent);
    const iterationsBytes = new Uint8Array(ITERATIONS);
    console.log('bug here');
    console.log(salt);
    console.log(iv);
    console.log(iterationsBytes);
    console.log(encryptedBytes);
    const encryptedPackage = concat(
      salt,
      iv,
      iterationsBytes,
      encryptedBytes
    );
    console.log('bug solved');
    // const encryptedBase64 = atob(decode(encryptedPackage));  // byteArray -> ascii -> base64
    const encryptedBase64 = encryptedPackage;  // byteArray (debug)
    const dataObject = {
      encryptedMessage: encryptedBase64,
      decryptedMessage: new Uint8Array([])
    };
    postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
  });
}

const workerDecrypt = (encryptedPackage, passwordAsBytes) => {
  const encryptedBytes = encode(btoa(encryptedPackage));
  const salt = encryptedBytes.slice(0, 32);
  const iv = encryptedBytes.slice(32, 12);
  const iterations = encryptedBytes.slice(32 + 12, 1);
  const encryptedData = encryptedBytes.slice(32 + 12 + 1);
  return self.crypto.subtle.importKey(
    'raw',
    passwordAsBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  )
  .then(passwordKey => {
    return self.crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: iterations,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  })
  .then(aesKey => {
    return self.crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, encryptedData);
  })
  .then(decryptedContent => {
    const decryptedBytes = new Uint8Array(decryptedContent);  // to text in main.js
    const dataObject = {
      encryptedMessage: new Uint8Array([]),
      decryptedMessage: decryptedBytes
    };
    postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
  });
}

self.onmessage = event => {
  if (event.data.encryptedMessage.length > 0) {
    workerEncrypt(event.data.encryptedMessage, event.data.passwordAsBytes);
  } else {
    workerDecrypt(event.data.decryptedMessage, event.data.passwordAsBytes);
  }
}
