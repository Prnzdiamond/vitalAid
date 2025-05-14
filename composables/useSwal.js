// composables/useSwal.js
import Swal from 'sweetalert2';

export const useSwal = () => {
    // Create a custom SweetAlert instance with styling to match your layout
    const swal = Swal.mixin({
        // Match your UI colors and styling
        background: '#FFFFFF',
        confirmButtonColor: '#3B82F6', // blue-600 like your chat button
        cancelButtonColor: '#E5E7EB', // gray-200
        buttonsStyling: true,
        customClass: {
            popup: 'rounded-lg shadow-lg',
            title: 'text-gray-800 font-semibold',
            confirmButton: 'rounded-md font-medium',
            cancelButton: 'rounded-md font-medium',
        },
        // Add a subtle animation matching your app's clean feel
        showClass: {
            popup: 'animate__animated animate__fadeIn animate__faster'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut animate__faster'
        }
    });

    // Toast configuration for non-intrusive notifications
    const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        background: '#FFFFFF',
        customClass: {
            popup: 'rounded-md shadow-md'
        }
    });

    // Return both the customized swal instance and the toast mixin
    return {
        swal,
        toast
    };
};

export default useSwal;