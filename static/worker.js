const ITERATIONS = 250000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;
// TODO: Store the number of iterations somewhere for each encrypted package.
// NOTE: Concatenation is troublesome, maybe store separately in the db.

const encode = d => new TextEncoder('utf-8').encode(d);
const decode = e => new TextDecoder('utf-8').decode(e);

const concat = a => {
  let l = 0;
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    l += a[i].length;
  }
  let r = new Uint8Array(l);
  for (let i = 0; i < a.length; i++) {
    r.set(a[i], c);
    c += a[i].length;
  }
  return r;
}

const workerEncrypt = (dataAsBytes, passwordAsBytes) => {
  const salt = self.crypto.getRandomValues(new Uint8Array(32));
  const iv = self.crypto.getRandomValues(new Uint8Array(12));
  self.crypto.subtle.importKey(
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
      iterations: ITERATIONS,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  })
  .then(aesKey => {
    return self.crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, dataAsBytes);
  })
  .then(encryptedContent => {
    const encryptedBytes = new Uint8Array(encryptedContent);
    console.log(salt);
    console.log(iv);
    const encryptedPackage = concat([
      salt,
      iv,
      encryptedBytes
    ]);
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
  // const encryptedBytes = encode(btoa(encryptedPackage));  // base64 -> ascii -> byteArray
  const encryptedBytes = encryptedPackage;  // debug
  const salt = encryptedBytes.slice(0, SALT_LENGTH);
  const iv = encryptedBytes.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encryptedData = encryptedBytes.slice(SALT_LENGTH + IV_LENGTH);
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
      iterations: ITERATIONS,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['decrypt']);
  })
  .then(aesKey => {
    console.log(salt);
    console.log(iv);
    console.log('The salt and iv don\'t match from encryption to decryption.');
    console.log('Check encoding and decoding.')
    return self.crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, encryptedData);
  })
  .then(decryptedContent => {
    console.log('If you can read this, then the bug has been fixed.');
    console.log(decryptedContent);
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
