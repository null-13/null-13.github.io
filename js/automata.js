(function() {
  var Conrand;

  Conrand = (function() {
    class Conrand {
      constructor() {
        this.tick = this.tick.bind(this);
        this.createCanvas();
        this.seed();
        this.tick();
      }

      createCanvas() {
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.canvas.height = this.canvasheight;
        this.canvas.width = this.canvaswidth;
        this.canvas.setAttribute('tabindex', 0);
        this.drawingContext = this.canvas.getContext('2d');
        this.canvas.addEventListener('click', (e) => {
          var clickX, clickY, rect;
          rect = this.canvas.getBoundingClientRect();
          clickX = e.clientX - rect.left;
          clickY = e.clientY - rect.top;
          return this.nodeArray.push(this.createCircle(clickX, clickY, 2));
        });
        return this.canvas.addEventListener('keydown', (e) => {
          if (e.keyCode === 32) {
            return this.paused = !this.paused;
          }
        });
      }

      seed() {
        var i, node, ref, results;
        this.nodeArray = [];
        results = [];
        for (node = i = 0, ref = this.initialnodes; (0 <= ref ? i < ref : i > ref); node = 0 <= ref ? ++i : --i) {
          results.push(this.nodeArray[node] = this.createSeedCircle());
        }
        return results;
      }

      createSeedCircle() {
        return this.createCircle(this.canvas.width * Math.random(), this.canvas.height * Math.random(), 2);
      }

      createCircle(x, y, r) {
        return {
          xPos: x,
          yPos: y,
          radius: r,
          alive: true
        };
      }

      tick() {
        if (this.paused === false) {
          this.cull();
          this.vibrate();
          this.evolve();
        }
        this.draw();
        return setTimeout(this.tick, this.tickLength);
      }

      vibrate() {
        var i, len, node, ref;
        ref = this.nodeArray;
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          node.xPos = node.xPos + ((Math.random() - 0.5) * 2 * this.noise);
        }
        node.yPos = node.yPos + ((Math.random() - 0.5) * 2 * this.noise);
        return this.rectifyNode(node);
      }

      evolve() {
        var i, j, k, len, len1, len2, neighbor, neighbors, newArray, newNode, node, ref, test, theta;
        newArray = [];
        if (this.nodeArray.length <= 1) {
          this.seed();
        }
        ref = this.nodeArray;
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          if (node.alive === true) {
            neighbors = this.getNeighbors(node, this.nodeArray, this.neighborhood);
            test = true;
            for (j = 0, len1 = neighbors.length; j < len1; j++) {
              neighbor = neighbors[j];
              if (this.getNeighbors(neighbor, this.nodeArray, this.neighborhood).length !== neighbors.length) {
                test = false;
                break;
              }
            }
            if (test === true) {
              theta = (Math.PI / 3) * neighbors.length;
              for (k = 0, len2 = neighbors.length; k < len2; k++) {
                neighbor = neighbors[k];
                newNode = this.thirdNode(node, neighbor, theta);
                newArray.push(newNode);
              }
            }
          }
        }
        return this.nodeArray = this.nodeArray.concat(newArray);
      }

      cull() {
        var i, index, len, neighbors, node, ref, results;
        ref = this.nodeArray;
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          neighbors = this.getNeighbors(node, this.nodeArray, this.neighborhood);
          if (neighbors.length < this.loneliness || neighbors.length > this.crowdedness) {
            node.alive = false;
          }
        }
        index = this.nodeArray.length - 1;
        results = [];
        while (index >= 0) {
          if (this.nodeArray[index].alive === false) {
            this.nodeArray.splice(index, 1);
            index--;
          }
          results.push(index--);
        }
        return results;
      }

      getDistance(a, b) {
        var sumOfSquares, xdiff, ydiff;
        xdiff = b.xPos - a.xPos;
        ydiff = b.yPos - a.yPos;
        sumOfSquares = Math.pow(xdiff, 2) + Math.pow(ydiff, 2);
        return Math.sqrt(sumOfSquares);
      }

      getNeighbors(node, array, distance) {
        var d, i, len, neighbors, x;
        neighbors = [];
        for (i = 0, len = array.length; i < len; i++) {
          x = array[i];
          d = this.getDistance(node, x);
          if (d < distance && d > 1) {
            neighbors.push(x);
          }
        }
        return neighbors;
      }

      rectifyNode(node) {
        if (node.xPos > this.canvas.width) {
          node.xPos = this.canvas.width;
        }
        if (node.yPos > this.canvas.height) {
          node.yPos = this.canvas.height;
        }
        if (node.xPos < 0) {
          node.xPos = 0;
        }
        if (node.yPos < 0) {
          return node.yPos = 0;
        }
      }

      thirdNode(node, pivot, theta) {
        var c, newCircle, newX, newY, s, tX, tY;
        s = Math.sin(theta);
        c = Math.cos(theta);
        tX = node.xPos - pivot.xPos;
        tY = node.yPos - pivot.yPos;
        newX = (tX * c) - (tY * s);
        newY = (tX * s) + (tY * c);
        newX = newX + pivot.xPos;
        newY = newY + pivot.yPos;
        newCircle = this.createCircle(newX, newY, node.radius);
        this.rectifyNode(newCircle);
        return newCircle;
      }

      draw() {
        var i, len, node, ref, results;
        this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ref = this.nodeArray;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          node = ref[i];
          this.drawConnections(node, this.nodeArray, this.neighborhood);
          results.push(this.drawCircle(node));
        }
        return results;
      }

      drawConnections(node, array, distance) {
        var context, i, len, neighbors, results, x;
        neighbors = this.getNeighbors(node, array, distance);
        context = this.drawingContext;
        context.lineWidth = 1;
        if (neighbors.length > 4) {
          context.strokeStyle = 'white';
        } else if (neighbors.length > 2) {
          context.strokeStyle = 'rgb(242, 198, 65)';
        } else if (neighbors.length > 0) {
          context.strokeStyle = 'orange';
        }
        results = [];
        for (i = 0, len = neighbors.length; i < len; i++) {
          x = neighbors[i];
          context.beginPath();
          context.moveTo(node.xPos, node.yPos);
          context.lineTo(x.xPos, x.yPos);
          results.push(context.stroke());
        }
        return results;
      }

      drawCircle(circle) {
        this.drawingContext.fillStyle = 'white';
        this.drawingContext.lineWidth = 2;
        this.drawingContext.strokeStyle = 'rgba(242, 198, 65, 0.1)';
        this.drawingContext.beginPath();
        this.drawingContext.arc(circle.xPos, circle.yPos, circle.radius, 0, 2 * Math.PI, false);
        this.drawingContext.fill();
        return this.drawingContext.stroke();
      }

    };

    Conrand.prototype.nodeArray = null;

    Conrand.prototype.canvas = null;

    Conrand.prototype.drawingContext = null;

    //graphics parameters
    Conrand.prototype.canvasheight = window.innerHeight;

    Conrand.prototype.canvaswidth = window.innerWidth;

    //game parameters
    Conrand.prototype.tickLength = 100;

    Conrand.prototype.initialnodes = 200;

    Conrand.prototype.neighborhood = 36;

    Conrand.prototype.noise = 4;

    Conrand.prototype.loneliness = 1;

    Conrand.prototype.crowdedness = 5;

    Conrand.prototype.paused = false;

    return Conrand;

  }).call(this);

  window.Conrand = Conrand;

}).call(this);


//# sourceMappingURL=automata.js.map
//# sourceURL=coffeescript
