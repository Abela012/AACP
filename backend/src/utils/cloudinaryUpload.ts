import cloudinary from '../config/cloudinary';

export const uploadBufferToCloudinary = (
    buffer: Buffer,
    folder = 'aacp/payment-proofs'
): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'auto',
            },
            (error, result) => {
                if (result) {
                    resolve({
                        secure_url: result.secure_url,
                        public_id: result.public_id,
                    });
                } else {
                    reject(error || new Error('Cloudinary upload failed'));
                }
            }
        );
        stream.end(buffer);
    });
};
