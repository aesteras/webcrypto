const ITERATIONS = 250000;
const SALT_LENGTH = 32;
const IV_LENGTH = 12;

const UTF8 = {
  encode: d => new TextEncoder('utf-8').encode(d),
  decode: e => new TextDecoder('utf-8').decode(e)
};

const encrypt = async (dataAsBytes, passwordAsBytes) => {
  const salt = self.crypto.getRandomValues(new Uint8Array(32));
  const iv = self.crypto.getRandomValues(new Uint8Array(12));
  const passwordKey = await self.crypto.subtle.importKey(
    'raw',
    passwordAsBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  const aesKey = await self.crypto.subtle.deriveKey({
      name: 'PBKDF2',
      salt,
      iterations: ITERATIONS,
      hash: {name: 'SHA-256'}
    }, passwordKey, {name: 'AES-GCM', length: 256}, false, ['encrypt']);
  const encryptedContent = await self.crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv
    }, aesKey, dataAsBytes);
  const encryptedBytes = new Uint8Array(encryptedContent);
  const encryptedObject = JSON.stringify({
    'sl': btoa(salt),
    'it': ITERATIONS,
    'iv': btoa(iv),
    'ed': btoa(encryptedBytes)
  });
  const dataObject = {
    encryptedMessage: UTF8.encode(encryptedObject),
    decryptedMessage: new Uint8Array()
  };
  postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
}

const decrypt = async (encryptedPackage, passwordAsBytes) => {
  const encryptedObject = JSON.parse(UTF8.decode(encryptedPackage));
  const salt = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.sl) + ']'));
  const iterations = encryptedObject.it;
  const iv = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.iv) + ']'));
  const encryptedBytes = Uint8Array.from(JSON.parse('[' + atob(encryptedObject.ed) + ']'));
  const passwordKey = await self.crypto.subtle.importKey('raw', passwordAsBytes, 'PBKDF2', false, ['deriveKey']);
  const aesKey = await self.crypto.subtle.deriveKey({
    name: 'PBKDF2',
    salt,
    iterations: iterations,
    hash: { name: 'SHA-256' }
  }, passwordKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decryptedContent = await self.crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv
  }, aesKey, encryptedBytes);
  const decryptedBytes = new Uint8Array(decryptedContent);
  const dataObject = {
    encryptedMessage: new Uint8Array(),
    decryptedMessage: decryptedBytes
  };
  postMessage(dataObject, [dataObject.encryptedMessage.buffer, dataObject.decryptedMessage.buffer]);
}

self.onmessage = event => {
  if (event.data.function == 'encrypt') {
    encrypt(event.data.decryptedMessage, event.data.passwordAsBytes);
  } else {
    decrypt(event.data.encryptedMessage, event.data.passwordAsBytes);
  }
}
