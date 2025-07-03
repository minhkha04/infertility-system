export function setLocalStorage(key, value) {
  // chuyen doi qua chuoi JSON
  const stringJson = JSON.stringify(value);
  localStorage.setItem(key, stringJson);
}

export function getLocgetlStorage(key) {
  // lay du lieu tu local
  const dataLocal = localStorage.getItem(key);
  // kiem tra du lieu khac null thi parse no ra object
  return dataLocal ? JSON.parse(dataLocal) : null;
}
