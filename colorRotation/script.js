const btnRotate = document.getElementById('btn_rotate');
const btnHue = document.getElementById('btn_hue');
const btnRGB = document.getElementById('btn_rgb');
const btnCYM = document.getElementById('btn_cym');

cc = document.getElementById('color-circle');

btnRotate.addEventListener('click', function(){
const result = cc.classList.toggle('rotate');

if (result) {
    btnRotate.textContent = `Start`;
} else {
    btnRotate.textContent = `Stop`;
}
});

btnHue.addEventListener('click', function(){
    cc.classList.remove('conic-gradient-hue-2');
    cc.classList.remove('conic-gradient-rgb-2');
    cc.classList.remove('conic-gradient-cmy-2');
    cc.classList.add('conic-gradient-hue-2');
})

btnRGB.addEventListener('click', function(){
    cc.classList.remove('conic-gradient-hue-2');
    cc.classList.remove('conic-gradient-rgb-2');
    cc.classList.remove('conic-gradient-cmy-2');
    cc.classList.add('conic-gradient-rgb-2');
})

btnCYM.addEventListener('click', function(){
    cc.classList.remove('conic-gradient-hue-2');
    cc.classList.remove('conic-gradient-rgb-2');
    cc.classList.remove('conic-gradient-cmy-2');
    cc.classList.add('conic-gradient-cmy-2');
})

function update_field(){
    var result = $('#rotate_speed').val()
    cc.style.animation = `${result}s linear infinite rotation360`
}
$(function() {
  $('input[type="number"]').on('keyup change', function() {
    update_field();
  });
});