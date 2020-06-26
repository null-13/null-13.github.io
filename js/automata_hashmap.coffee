class Conrand

	nodeMap: null
	nodeArray: null
	canvas: null
	drawingContext: null

	#graphics parameters

	canvasheight: window.innerHeight
	canvaswidth: window.innerWidth

	#game parameters

	bucketCount: 64
	tickLength: 100
	initialnodes: 200
	neighborhood: 36
	noise: 4
	loneliness: 1
	crowdedness: 5
	paused: false

	constructor: ->
		@createCanvas()
		@seed()
		@tick()
		@seedBuckets()

		testval = 62
		testcol = @getColumn(testval)
		testrow = @getRow(testval)
		test = @getNeighborBuckets(testval)

	createCanvas: ->
		@canvas = document.createElement 'canvas'
		document.body.appendChild @canvas
		@canvas.height = @canvasheight
		@canvas.width = @canvaswidth
		@canvas.setAttribute('tabindex', 0)
		@drawingContext = @canvas.getContext '2d'

		@canvas.addEventListener 'click', (e) =>
			rect = @canvas.getBoundingClientRect()
			clickX = e.clientX - rect.left
			clickY = e.clientY - rect.top
			@nodeArray.push(@createCircle(clickX, clickY, 2))

		@canvas.addEventListener 'keydown', (e) =>
			if e.keyCode is 32
				@paused = !@paused

	seed: ->
		@nodeArray = []

		for node in [0...@initialnodes]
			@nodeArray[node] =
			@createSeedCircle()

	seedBuckets: ->
		@nodeMap = []
		for i in [0...@bucketCount]
			@nodeMap[i] = {
			index:i,
			nodeList: []
			}

		for node in [0...@initialnodes]
			newNode = @createSeedCircle()
			i = @findBucket(newNode.xPos, newNode.yPos)
			@nodeMap[i].nodeList.push(newNode)

	findBucket: (x, y) ->

		# 00 01 02 03 04 05 06 07 
		# 08 09 10 11 12 13 14 15
		# 16 17 18 19 20 21 22 23
		# 24 25 26 27 28 29 30 31
		# 32 33 34 35 36 37 38 39 
		# 40 41 42 43 44 45 46 47
		# 48 49 50 51 52 53 54 55
		# 56 57 58 59 60 61 62 63

		buckDim = Math.sqrt(@bucketCount)

		bucketWidth = Math.floor(@canvaswidth / buckDim)
		bucketHeight = Math.floor(@canvasheight / buckDim)

		row = Math.floor(y / bucketHeight)		#3
		column = Math.floor(x / bucketWidth)	#4

		index = column + (row * buckDim) #4 + (3 * 8) = 28

		return Math.floor(index)

	getRow: (i) ->

		return Math.floor(i / Math.sqrt(@bucketCount))
	
	getColumn: (i) ->

		return Math.floor(i % Math.sqrt(@bucketCount))

	getIndex: (row, column) ->

		buckDim = Math.sqrt(@bucketCount)

		if (row < buckDim && column < buckDim && row >= 0 && column >= 0)

			return Math.floor( column + (row * Math.sqrt(@bucketCount)) )

	getNeighborBuckets: (i) ->

		neighBuckets = []

		row = @getRow(i)
		column = @getColumn(i)
		
		verticalNeigh = [-1, 0, 1]
		horizNeigh = [-1, 0, 1]

		for( eltV : verticalNeigh ) {
			for ( eltH : horizNeigh ) {
				neighBuckets.push(@getIndex(row + eltV, column + eltH))
			}
		}

		neighBuckets = index for index in neighBuckets when (index > 0 and index < @bucketCount)

		return neighBuckets

	getNeighbors_buckets: (node, buckets, distance) ->

		neighbors = []

		for bucket in buckets

			for x in bucket.nodeList

				d = @getDistance(node, x)

				if d < distance and d > 1
					neighbors.push x

		return neighbors

	createSeedCircle: ->
		@createCircle(this.canvas.width * Math.random(), this.canvas.height * Math.random(), 2)

	createCircle: (x, y, r) ->
		{ xPos: x, yPos: y, radius: r, alive: true }

	tick: =>

		if @paused is false
			@cull()
			@vibrate()
			@evolve()

		@draw()

		setTimeout @tick, @tickLength

	vibrate: ->

		for node in @nodeArray
			node.xPos = node.xPos + ((Math.random() - 0.5) * 2 * @noise)
		node.yPos = node.yPos + ((Math.random() - 0.5) * 2 * @noise)
		@rectifyNode node

	evolve: ->

		newArray = []

		if @nodeArray.length <= 1
			@seed()

		for node in @nodeArray

			if node.alive is true

				neighbors = @getNeighbors(node, @nodeArray, @neighborhood)

				test = true

				for neighbor in neighbors

					if @getNeighbors(neighbor, @nodeArray, @neighborhood).length != neighbors.length

						test = false
						break

				if test is true

					theta = (Math.PI / 3) * neighbors.length

					for neighbor in neighbors

						newNode = @thirdNode(node, neighbor, theta)
						newArray.push(newNode)

		@nodeArray = @nodeArray.concat(newArray)

	cull: ->

		for node in @nodeArray

			neighbors = @getNeighbors(node, @nodeArray, @neighborhood)

			if neighbors.length < @loneliness or neighbors.length > @crowdedness

				node.alive = false

		index = @nodeArray.length - 1

		while (index >= 0)
			if @nodeArray[index].alive is false
				@nodeArray.splice(index, 1)
				index--
			index--

	getDistance: (a, b) ->

		xdiff = b.xPos - a.xPos
		ydiff = b.yPos - a.yPos
		sumOfSquares = Math.pow(xdiff, 2) + Math.pow(ydiff, 2)

		return Math.sqrt(sumOfSquares)

	getNeighbors: (node, array, distance) ->

		neighbors = []

		for x in array

			d = @getDistance(node, x)

			if d < distance and d > 1
				neighbors.push x

		return neighbors

	rectifyNode: (node) ->

		if node.xPos > @canvas.width
			node.xPos = @canvas.width

		if node.yPos > @canvas.height
			node.yPos = @canvas.height

		if node.xPos < 0
			node.xPos = 0

		if node.yPos < 0
			node.yPos = 0

	thirdNode: (node, pivot, theta) ->

		s = Math.sin(theta)
		c = Math.cos(theta)

		tX = node.xPos - pivot.xPos
		tY = node.yPos - pivot.yPos

		newX = (tX * c) - (tY * s)
		newY = (tX * s) + (tY * c)

		newX = newX + pivot.xPos
		newY = newY + pivot.yPos

		newCircle = @createCircle(newX, newY, node.radius)
		@rectifyNode newCircle

		return newCircle

	draw: ->

		@drawingContext.clearRect(0, 0, @canvas.width, @canvas.height)

		for node in @nodeArray
			@drawConnections(node, @nodeArray, @neighborhood)
			@drawCircle node

	drawConnections: (node, array, distance) ->

		neighbors = @getNeighbors(node, array, distance)
		context = @drawingContext
		context.lineWidth = 1

		if neighbors.length > 4
			context.strokeStyle = 'white'
		else if neighbors.length > 2
			context.strokeStyle = 'rgb(242, 198, 65)'
		else if neighbors.length > 0
			context.strokeStyle = 'orange'

		for x in neighbors

			context.beginPath()
			context.moveTo(node.xPos, node.yPos)
			context.lineTo(x.xPos, x.yPos)
			context.stroke()

	drawCircle: (circle) ->

		@drawingContext.fillStyle = 'white'
		@drawingContext.lineWidth = 2
		@drawingContext.strokeStyle = 'rgba(242, 198, 65, 0.1)'
		@drawingContext.beginPath()
		@drawingContext.arc(circle.xPos, circle.yPos, circle.radius, 0, 2 * Math.PI, false)
		@drawingContext.fill()
		@drawingContext.stroke()

window.Conrand = Conrand
