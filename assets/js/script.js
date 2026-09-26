document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('.blow-up-image'); // Select all images

    // Function to apply the "blow-up" effect when the image comes into view
    function blowUpEffect(image) {
        // Generate random values for movement, rotation, and scaling
        const randomX = Math.random() * 600 - 300;  // Random horizontal movement between -300px and 300px
        const randomY = Math.random() * 600 - 300;  // Random vertical movement between -300px and 300px
        const randomRotate = Math.random() * 720 - 360; // Random rotation from -360 to 360 degrees
        const randomScale = Math.random() * 2 + 0.5; // Random scaling from 0.5x to 2.5x

        // Apply the transformations and opacity change
        image.style.transition = 'transform 1s ease, opacity 1s ease'; // Add smooth transitions for transformation and opacity
        image.style.transform = `scale(${randomScale}) translate(${randomX}px, ${randomY}px) rotate(${randomRotate}deg)`;
        image.style.opacity = 0; // Fade out the image during the "explosion"
    }

    // Set up the IntersectionObserver to detect when an image is in view
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const image = entry.target;
                blowUpEffect(image); // Trigger the blow-up effect
                observer.unobserve(image); // Stop observing after the effect has been triggered
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the image is visible in the viewport
    });

    // Observe each image
    images.forEach(image => {
        observer.observe(image);
    });
});
