module.exports = function(window) {
    this._rem = false;
    this._win = window;
    this._move = false;
    this._oldRes = this._win.getSize();
    this._wRatio = 0;
    this._hRatio = 0;
    this._topBarSize = 0;
    this._func1 = (wRatio, hRatio) => {
        if (!this._ended && !this._move) {
            let size = this._win.getSize();
            let widthChanged = this._oldRes[0] != size[0];
            var ratioY2X = this._hRatio / this._wRatio;
            if (widthChanged) {
                this._win.setSize(size[0], parseInt(((size[0] * ratioY2X) + this._topBarSize).toString()));
            } else {
                this._win.setSize(parseInt((size[1] / ratioY2X).toString()), size[1]);
            }
        }
        this._move = false;
    }
    this._func2 = () => {
        this._rem = true;
    }
    this._ended = false;
    /**
     * @description A command to set and lock the Ratio of the window supplyed at the creation of this object
     * @param {number} wRatio The ratio width of the window
     * @param {number} hRatio The ratio height of the window
     * @param {number} [sLoop=10] How many milliseconds between each size update
     */
    this.setRatio = function(wRatio, hRatio, topBarSize, sLoop = 10) {
        this._resLoop = setInterval(() => {
            if (!this._rem) {
                this._oldRes = this._win.getSize();
            }
        }, sLoop);
        this._wRatio = wRatio;
        this._hRatio = hRatio;
        this._topBarSize = topBarSize;
        this._win.on('will-move', () => {
            this._move = true;
        })
        this._win.on('resize', this._func1);
        this._win.on('close', this._func2);
        this.setRatio = function() {
            throw new Error("You can't run this command twice without stopping it first");
        }
    }
    this.stop = function() {
        clearInterval(this._resLoop);
        this._ended = true;
        this.setRatio = function(wRatio, hRatio, topBarSize, sLoop = 10) {
            this._ended = false;
            this._resLoop = setInterval(() => {
                if (!this._rem) {
                    this._oldRes = this._win.getSize();
                }
            }, sLoop);
            this._wRatio = wRatio;
            this._hRatio = hRatio;
            this.setRatio = function() {
                throw new Error("You can't run this command twice without stopping it first");
            }
        }
    }
}