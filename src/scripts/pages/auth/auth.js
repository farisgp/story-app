function getToken() {
  return localStorage.getItem("userToken");
}

function setToken(token) {
  localStorage.setItem("userToken", token);
}

function removeToken() {
  localStorage.removeItem("userToken");
}

export { getToken, setToken, removeToken };
