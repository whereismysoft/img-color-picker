{ 
    const ZOOM_CANVAS_RADIUS = 40;
    const ZOOM_AREA_SIZE = 4;

    const canvas = document.getElementById('cnvs');
    const zoomBlock = document.getElementById("zoom_block")
    const zoomBlockCanvas = document.getElementById("zoom");
    const imgInput = document.getElementById('file_input');
    const picker = document.getElementById('picker');
    const zoomHexText = document.getElementById('zoom_hex');
    const hexText = document.getElementById('hex');
    
    function rgba2hex(data) {
        let alpha = data[3] / 255 || 01,
            hex =
            (data[0] | 1 << 8).toString(16).slice(1) +
            (data[1] | 1 << 8).toString(16).slice(1) +
            (data[2] | 1 << 8).toString(16).slice(1);

        alpha = ((alpha * 255) | 1 << 8).toString(16).slice(1)
        hex = hex + alpha;

        return hex.toString();
    }

    class ImageDrawer {
        constructor(img, imageCanvasBlock, zoomBlock, zoomCanvasRadius, zoomAreaSize) {
            const {width, height} = this.calculateImageSizes(img);
            this.image = img;

            this.canvasImageWidth = width;
            this.canvasImageHeight = height;
            
            this.imgCanvas = imageCanvasBlock;
            this.imgCanvasCtx = imageCanvasBlock.getContext("2d");

            this.canvasOffset

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

        getDropperColor = () => {
            const pixel = this.zoomBlockCtx.getImageData(this.zoomBlockRadius, this.zoomBlockRadius, this.zoomedAreaSize, this.zoomedAreaSize);
            const hexColor = rgba2hex(pixel.data);

            hexText.innerText = '#' + hexColor;
        }

        setImageSmoothing = (status = false) => {
            const smoothingProperties = ['imageSmoothingEnabled', 'mozImageSmoothingEnabled', 'webkitImageSmoothingEnabled', 'msImageSmoothingEnabled']
            smoothingProperties.forEach( smoothing => this.zoomBlockCtx[smoothing] = status)
        }
        
        startDraw = () => {
            this.imgCanvas.width = this.canvasImageWidth;
            this.imgCanvas.height = this.canvasImageHeight;

            this.canvasOffset = this.imgCanvas.getBoundingClientRect();

            this.zoomBlock.width = this.zoomBlockDiameter;
            this.zoomBlock.height = this.zoomBlockDiameter;

            this.imgCanvasCtx.drawImage(this.image, 0, 0, this.canvasImageWidth, this.canvasImageHeight);

            this.setImageSmoothing(true)
        }

        drawEmptyDropper() {
            this.zoomBlockCtx.fillStyle = "white"
            this.zoomBlockCtx.fillRect(0, 0,this.zoomBlockDiameter,this.zoomBlockDiameter);
            requestAnimationFrame(() => this.setCircleColor('#D9D9D9'))
        }

        onImageMouseMove = ({pageX, pageY}) => {
            const isOutsideImage = pageX < this.canvasOffset.x || pageY < this.canvasOffset.y || pageX > this.canvasOffset.right || pageY > this.canvasOffset.bottom;

            requestAnimationFrame(() => zoomBlock.style.transform = `translate(${pageX - ZOOM_CANVAS_RADIUS}px, ${pageY - ZOOM_CANVAS_RADIUS}px)`)

            if (isOutsideImage) {
                this.drawEmptyDropper();
                return
            }

            requestAnimationFrame( () => {
                this.zoomBlockCtx.drawImage(
                    this.imgCanvas,
                    Math.min(Math.max(0, pageX - this.canvasOffset.x - 4), this.canvasImageWidth - 8),
                    Math.min(Math.max(0, pageY - this.canvasOffset.y - 4), this.canvasImageHeight - 8),
                    8,
                    8,
                    0,
                    0,
                    this.zoomBlockDiameter,
                    this.zoomBlockDiameter
                );
            })

            requestAnimationFrame(this.setCircleColor)
        };

        setCircleColor = (color) => {
            if (typeof color == 'string') {
                this.drawCircle(color)
                return
            }
            const pixel = this.zoomBlockCtx.getImageData(this.zoomBlockRadius, this.zoomBlockRadius, this.zoomedAreaSize, this.zoomedAreaSize);
            const hexColor = rgba2hex(pixel.data);
            zoomHexText.innerText = '#' + hexColor;

            this.drawCircle(`#${hexColor}`)
        }

        drawCircle = (strokeColor) => {
            this.zoomBlockCtx.beginPath();
            this.zoomBlockCtx.lineWidth = 10;
            this.zoomBlockCtx.strokeStyle = strokeColor
            this.zoomBlockCtx.arc(this.zoomBlockRadius, this.zoomBlockRadius, this.zoomBlockRadius, 0, 2 * Math.PI, false);;
            this.zoomBlockCtx.stroke();
            this.zoomBlockCtx.closePath();
        }
    }


    function omImageLoad() {
        const imgDrawer = new ImageDrawer(this, canvas, zoomBlockCanvas, ZOOM_CANVAS_RADIUS, ZOOM_AREA_SIZE);
        
        imgDrawer.startDraw()

        picker.onclick = function() {
            if (zoomBlock.classList.contains('invisible')) {
                zoomBlock.classList.remove('invisible');
                imgDrawer.drawEmptyDropper();
                document.addEventListener('mousemove', imgDrawer.onImageMouseMove);
                zoomBlockCanvas.addEventListener('click', imgDrawer.getDropperColor);
                document.body.style.cursor = 'none';
            } else {
                zoomBlock.classList.add('invisible')
                document.removeEventListener('mousemove', imgDrawer.onImageMouseMove)
            }
        }
    }

    function onFileInputChange(e) {
        const [file] = imgInput.files

        if (file) {
            const image = new Image();

            image.src = URL.createObjectURL(file);
            image.onload = omImageLoad
            imgInput.classList.add('invisible')
        }
    }

    imgInput.addEventListener('change', onFileInputChange)

}