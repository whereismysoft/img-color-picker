{ 
    const ZOOM_CANVAS_RADIUS = 40
    const ZOOM_AREA_SIZE = 4;

    function rgba2hex(data) {
        let alpha = data[3] / 255 || 01,
            hex =
            (data[0] | 1 << 8).toString(16).slice(1) +
            (data[1] | 1 << 8).toString(16).slice(1) +
            (data[2] | 1 << 8).toString(16).slice(1);

        alpha = ((alpha * 255) | 1 << 8).toString(16).slice(1)
        hex = hex + alpha;

        return hex;
    }

    class ImageDrawer {
        constructor(img, imageCanvasBlock, zoomBlock, zoomCanvasRadius, zoomAreaSize) {
            const {width, height} = this.calculateImageSizes(img);

            this.image = img;

            this.canvasImageWidth = width;
            this.canvasImageHeight = height;

            this.imgCanvas = imageCanvasBlock;
            this.imgCanvasCtx = imageCanvasBlock.getContext("2d");

            this.zoomBlock = zoomBlock;
            this.zoomBlockCtx = zoomBlock.getContext("2d", { willReadFrequently: true });

            this.zoomBlockRadius = zoomCanvasRadius;
            this.zoomBlockDiameter = zoomCanvasRadius * 2;
            this.zoomedAreaSize = zoomAreaSize
        }

        calculateImageSizes(img) {
            // here we can add a scale logic for a large size images
            const height = img.naturalHeight / 2
            const width = img.naturalWidth / 2

            return {width, height}
        }
        
        startDraw = () => {
            this.imgCanvas.width = this.canvasImageWidth;
            this.imgCanvas.height = this.canvasImageHeight;

            this.zoomBlock.width = this.zoomBlockDiameter;
            this.zoomBlock.height = this.zoomBlockDiameter;

            this.imgCanvasCtx.drawImage(this.image, 0, 0, this.canvasImageWidth, this.canvasImageHeight);

            this.zoomBlockCtx.imageSmoothingEnabled = true;
            this.zoomBlockCtx.mozImageSmoothingEnabled = false;
            this.zoomBlockCtx.webkitImageSmoothingEnabled = false;
            this.zoomBlockCtx.msImageSmoothingEnabled = false;

            this.imgCanvas.addEventListener("mousemove", (event) => {
                const {layerX, layerY} = event

                
                this.drawZoom(layerX, layerY);
            });
        }

        drawZoom = (x, y) => {
            this.zoomBlockCtx.fillStyle = "white";
            this.zoomBlockCtx.fillRect(0, 0, this.zoomBlockDiameter, this.zoomBlockDiameter);

            this.zoomBlockCtx.drawImage(
                this.imgCanvas,
                x, y, 
                // x - (45 + 5),// Math.min(Math.max(0, x)),
                // y - 10,// Math.min(Math.max(0, y)),
                8,
                8,
                0,
                0,
                this.zoomBlockDiameter,
                this.zoomBlockDiameter
            );

            requestAnimationFrame(this.setSelectedColor)
        };

        setSelectedColor = () => {
            const pixel = this.zoomBlockCtx.getImageData(this.zoomBlockRadius, this.zoomBlockRadius, this.zoomedAreaSize, this.zoomedAreaSize);
            const hexColor = rgba2hex(pixel.data);
            
            this.drawCircle(hexColor)

            return hexColor;
        }

        drawCircle = (strokeColorNumber) => {
            this.zoomBlockCtx.beginPath();
            this.zoomBlockCtx.lineWidth = 7;
            this.zoomBlockCtx.strokeStyle = `#${strokeColorNumber}`
            this.zoomBlockCtx.arc(this.zoomBlockRadius, this.zoomBlockRadius, this.zoomBlockRadius, 0, 2 * Math.PI, false);;
            this.zoomBlockCtx.stroke();
            this.zoomBlockCtx.closePath();
        }
    }

    function make_base() {
        const image = new Image();
        image.src = 'assets/1920x1080-4598441-beach-water-pier-tropical-sky-sea-clouds-island-palm-trees.jpg';

        function omImageLoad() {
            const canvas = document.getElementById('cnvs')
            const zoomBlock = document.getElementById("zoom")

            const imgDrawer = new ImageDrawer(this, canvas, zoomBlock, ZOOM_CANVAS_RADIUS, ZOOM_AREA_SIZE);
            imgDrawer.startDraw()
        }
        // image.src = 'assets/istockphoto-154232673-1024x1024.jpg';
        image.onload = omImageLoad
    }

    make_base()

}