const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// Store key-value in local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// Retrieve value by key from local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// Generate a random 3-digit number
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clear local storage (optional utility)
function clear() {
  localStorage.clear();
}

// Generate SHA256 hash of a string
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// Get or generate SHA256 hash of a random 3-digit number
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) return cached;

  const randomPin = getRandomArbitrary(MIN, MAX).toString();
  const hash = await sha256(randomPin);
  store('sha256', hash);
  store('originalPin', randomPin); 
  return hash;
}

// Initialize hash display
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// Validate user input against hash
async function test() {
  const pin = pinInput.value;

  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Enter a 3-digit number';
    resultView.classList.remove('hidden');
    resultView.classList.remove('success');
    return;
  }

  const hashedInput = await sha256(pin);
  const correctHash = sha256HashView.innerHTML;

  if (hashedInput === correctHash) {
    resultView.innerHTML = '🎉 Correct!';
    resultView.classList.add('success');
  } else {
    resultView.innerHTML = '❌ Incorrect. Try again!';
    resultView.classList.remove('success');
  }

  resultView.classList.remove('hidden');
}

// Limit input to numbers and 3 digits only
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// Bind the check button to the test function
document.getElementById('check').addEventListener('click', test);

// Start on load
main();
