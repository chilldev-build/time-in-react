//named export shorthand

export const loadData = async url => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export const updateData = async url => {
  const response = await fetch(url, { method: 'PUT' });
  // console.log(await response);
  // const data = await response.json();
  // return data;
  return;
};

export const newData = async url => {
  const response = await fetch(url, { method: 'POST' });
  const data = await response.json();
  // return data;
  console.log(data.rows[0].starttime);
  return data.rows[0].starttime;
};