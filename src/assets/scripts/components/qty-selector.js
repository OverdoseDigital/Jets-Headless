const qtySelector = (decrementBtn, incrementBtn, input) => {
  if (!decrementBtn || !incrementBtn || !input) return;

  const inputMin = Number(input.getAttribute('min'));

  decrementBtn.addEventListener('click', () => {
    const newQty = Number(input.value) - 1;
    if (newQty <= 0) {
      return;
    }
    input.value = Number(newQty);
    if (newQty <= inputMin) {
      decrementBtn.setAttribute('disabled', '');
    }
  });

  incrementBtn.addEventListener('click', () => {
    const newQty = Number(input.value) + 1;
    input.value = Number(newQty);
    if (newQty > inputMin) {
      decrementBtn.removeAttribute('disabled');
    }
  });

  input.addEventListener('input', () => {
    if (input.value <= inputMin) {
      decrementBtn.setAttribute('disabled', '');
    } else {
      decrementBtn.removeAttribute('disabled');
    }
  });
};

export default qtySelector;
