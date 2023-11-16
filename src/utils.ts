import { pdfToPng } from 'pdf-to-png-converter';

export const convertPDFBinaryDataToBase64Image = async (
	binaryData: ArrayBuffer
): Promise<string[]> => {
	try {
		const buffer = Buffer.from(new Uint8Array(binaryData));

		const imgs = await pdfToPng(
			buffer, // The function accepts PDF file path or a Buffer
			{
				disableFontFace: false, // When `false`, fonts will be rendered using a built-in font renderer that constructs the glyphs with primitive path commands. Default value is true.
				useSystemFonts: false, // When `true`, fonts that aren't embedded in the PDF document will fallback to a system font. Default value is false.
				enableXfa: false, // Render Xfa forms if any. Default value is false.
				viewportScale: 2.0, // The desired scale of PNG viewport. Default value is 1.0.
				strictPagesToProcess: false, // When `true`, will throw an error if specified page number in pagesToProcess is invalid, otherwise will skip invalid page. Default value is false.
				verbosityLevel: 0, // Verbosity level. ERRORS: 0, WARNINGS: 1, INFOS: 5. Default value is 0.
			}
		);

		return imgs.map(img => img.content.toString('base64'));
	} catch (error) {
		throw Error(`pdf conversion failed: ${error}`);
	}
};
