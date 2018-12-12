let processData = data => {
  data.trans2 = data.trans1.sort();
  return data;
};

self.onmessage = event => {
  let data = event.data;
  data = processData(data);
  postMessage(data);
}
