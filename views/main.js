window.onload = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "admin.html";
  }
};
