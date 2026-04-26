import sharp from 'sharp';

interface ProcessedImage {
  image: Buffer;
  preview: Buffer;
  thumbnail: Buffer;
  blurDataUrl: string;
  width: number;
  height: number;
}

const TATTOO_MAX_WIDTH = 1920;
const TATTOO_MAX_HEIGHT = 1920;
const PREVIEW_SIZE = 800;
const THUMBNAIL_SIZE = 300;
const BLUR_SIZE = 16;
const QUALITY = 85;

// process, thumbnail, blur placeholder
export async function processTattooImage(input: Buffer): Promise<ProcessedImage> {
  const metadata = await sharp(input).metadata();
  const originalWidth = metadata.width ?? TATTOO_MAX_WIDTH;
  const originalHeight = metadata.height ?? TATTOO_MAX_HEIGHT;

  // resize main image, strip exif
  const image = await sharp(input)
    .rotate()
    .resize(TATTOO_MAX_WIDTH, TATTOO_MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .withMetadata({})
    .toBuffer();

  const resizedMeta = await sharp(image).metadata();

  // preview (800px)
  const preview = await sharp(input)
    .rotate()
    .resize(PREVIEW_SIZE, PREVIEW_SIZE, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80 })
    .withMetadata({})
    .toBuffer();

  // thumbnail (300px)
  const thumbnail = await sharp(input)
    .rotate()
    .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 75 })
    .withMetadata({})
    .toBuffer();

  // blur placeholder
  const blurBuffer = await sharp(input)
    .rotate()
    .resize(BLUR_SIZE, BLUR_SIZE, { fit: 'inside' })
    .webp({ quality: 20 })
    .withMetadata({})
    .toBuffer();

  const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString('base64')}`;

  return {
    image,
    preview,
    thumbnail,
    blurDataUrl,
    width: resizedMeta.width ?? originalWidth,
    height: resizedMeta.height ?? originalHeight,
  };
}

// resize avatar to square
export async function processAvatarImage(input: Buffer, size = 256): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .webp({ quality: QUALITY })
    .withMetadata({})
    .toBuffer();
}
