function showNotification() {
  const notification = document.getElementById('custom-notification');
notification.classList.remove('notification-hidden');
notification.classList.add('notification-show');
setTimeout(() => {notification.classList.remove('notification-show');
                  setTimeout(() =>
                    notification.classList.add('notification-hidden'),
300);
}, 4000);
}
document.getElementById('review-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('review-name').value.trim();
  const text = document.getElementById('review-text').value.trim();

  if (!name || !text) {
    alert('Please fill in all fields.');
    return;
  }

  const reviewData = { author: name, text };

  try {
    const response = await fetch('/add-review', {  // Relative URL works on Render too
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviewData),
    });

    if (response.ok) {
      showNotification();
      document.getElementById(review-form).reset();
    } else {
      alert('Failed to submit review.');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
  }
});
