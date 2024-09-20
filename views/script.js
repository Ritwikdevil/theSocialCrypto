window.addEventListener("scroll", () => {
  document.querySelector("header").classList.toggle("active", scrollY > 50);
});

$(".resp__toggler").click(function () {
  $("header nav .menu_wrapper").addClass("active");
});

$(".resp__closer").click(function () {
  $("header nav .menu_wrapper").removeClass("active");
});

$(".menus .menu_item.has-sub").each(function() {
  $(this).click(function() {
    $(this).toggleClass("show");
  })
})

