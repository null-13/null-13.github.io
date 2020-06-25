(function() {
  var Conrand;

  Conrand = (function() {
    class Conrand {
      constructor() {
        var test, testcol, testrow, testval;
        this.tick = this.tick.bind(this);
        this.createCanvas();
        this.seed();
        this.tick();
        this.seedBuckets();
        testval = 62;
        testcol = this.getColumn(testval);
        testrow = this.getRow(testval);
        test = this.getNeighborBuckets(testval);
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
        var j, node, ref, results;
        this.nodeArray = [];
        results = [];
        for (node = j = 0, ref = this.initialnodes; (0 <= ref ? j < ref : j > ref); node = 0 <= ref ? ++j : --j) {
          results.push(this.nodeArray[node] = this.createSeedCircle());
        }
        return results;
      }

      seedBuckets() {
        var i, j, k, newNode, node, ref, ref1, results;
        this.nodeMap = [];
        for (i = j = 0, ref = this.bucketCount; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
          this.nodeMap[i] = {
            index: i,
            nodeList: []
          };
        }
        results = [];
        for (node = k = 0, ref1 = this.initialnodes; (0 <= ref1 ? k < ref1 : k > ref1); node = 0 <= ref1 ? ++k : --k) {
          newNode = this.createSeedCircle();
          i = this.findBucket(newNode.xPos, newNode.yPos);
          results.push(this.nodeMap[i].nodeList.push(newNode));
        }
        return results;
      }

      findBucket(x, y) {
        var buckDim, bucketHeight, bucketWidth, column, index, row;
        // 00 01 02 03 04 05 06 07 
        // 08 09 10 11 12 13 14 15
        // 16 17 18 19 20 21 22 23
        // 24 25 26 27 28 29 30 31
        // 32 33 34 35 36 37 38 39 
        // 40 41 42 43 44 45 46 47
        // 48 49 50 51 52 53 54 55
        // 56 57 58 59 60 61 62 63
        buckDim = Math.sqrt(this.bucketCount);
        bucketWidth = Math.floor(this.canvaswidth / buckDim);
        bucketHeight = Math.floor(this.canvasheight / buckDim);
        row = Math.floor(y / bucketHeight); //3
        column = Math.floor(x / bucketWidth); //4
        index = column + (row * buckDim); //4 + (3 * 8) = 28
        return Math.floor(index);
      }

      getRow(i) {
        return Math.floor(i / Math.sqrt(this.bucketCount));
      }

      getColumn(i) {
        return Math.floor(i % Math.sqrt(this.bucketCount));
      }

      getIndex(row, column) {
        var buckDim;
        buckDim = Math.sqrt(this.bucketCount);
        if (row < buckDim && column < buckDim && row >= 0 && column >= 0) {
          return Math.floor(column + (row * Math.sqrt(this.bucketCount)));
        }
      }

      getNeighborBuckets(i) {
        var column, index, neighBuckets, row;
        neighBuckets = [];
        row = this.getRow(i);
        column = this.getColumn(i);
        neighBuckets.push(this.getIndex(row + 1, column + 1));
        neighBuckets.push(this.getIndex(row + 1, column - 1));
        neighBuckets.push(this.getIndex(row - 1, column + 1));
        neighBuckets.push(this.getIndex(row - 1, column - 1));
        neighBuckets.push(this.getIndex(row, column + 1));
        neighBuckets.push(this.getIndex(row, column - 1));
        neighBuckets.push(this.getIndex(row + 1, column));
        neighBuckets.push(this.getIndex(row - 1, column));
        neighBuckets = (function() {
          var j, len, results;
          results = [];
          for (j = 0, len = neighBuckets.length; j < len; j++) {
            index = neighBuckets[j];
            if (index > 0 && index < this.bucketCount) {
              results.push(index);
            }
          }
          return results;
        }).call(this);
        return neighBuckets;
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
        var j, len, node, ref;
        ref = this.nodeArray;
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
          node.xPos = node.xPos + ((Math.random() - 0.5) * 2 * this.noise);
        }
        node.yPos = node.yPos + ((Math.random() - 0.5) * 2 * this.noise);
        return this.rectifyNode(node);
      }

      evolve() {
        var j, k, l, len, len1, len2, neighbor, neighbors, newArray, newNode, node, ref, test, theta;
        newArray = [];
        if (this.nodeArray.length <= 1) {
          this.seed();
        }
        ref = this.nodeArray;
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
          if (node.alive === true) {
            neighbors = this.getNeighbors(node, this.nodeArray, this.neighborhood);
            test = true;
            for (k = 0, len1 = neighbors.length; k < len1; k++) {
              neighbor = neighbors[k];
              if (this.getNeighbors(neighbor, this.nodeArray, this.neighborhood).length !== neighbors.length) {
                test = false;
                break;
              }
            }
            if (test === true) {
              theta = (Math.PI / 3) * neighbors.length;
              for (l = 0, len2 = neighbors.length; l < len2; l++) {
                neighbor = neighbors[l];
                newNode = this.thirdNode(node, neighbor, theta);
                newArray.push(newNode);
              }
            }
          }
        }
        return this.nodeArray = this.nodeArray.concat(newArray);
      }

      cull() {
        var index, j, len, neighbors, node, ref, results;
        ref = this.nodeArray;
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
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
        var d, j, len, neighbors, x;
        neighbors = [];
        for (j = 0, len = array.length; j < len; j++) {
          x = array[j];
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
        var j, len, node, ref, results;
        this.drawingContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        ref = this.nodeArray;
        results = [];
        for (j = 0, len = ref.length; j < len; j++) {
          node = ref[j];
          this.drawConnections(node, this.nodeArray, this.neighborhood);
          results.push(this.drawCircle(node));
        }
        return results;
      }

      drawConnections(node, array, distance) {
        var context, j, len, neighbors, results, x;
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
        for (j = 0, len = neighbors.length; j < len; j++) {
          x = neighbors[j];
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

    Conrand.prototype.nodeMap = null;

    Conrand.prototype.nodeArray = null;

    Conrand.prototype.canvas = null;

    Conrand.prototype.drawingContext = null;

    //graphics parameters
    Conrand.prototype.canvasheight = window.innerHeight;

    Conrand.prototype.canvaswidth = window.innerWidth;

    //game parameters
    Conrand.prototype.bucketCount = 64;

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


//# sourceMappingURL=automata_hashmap.js.map
//# sourceURL=coffeescript