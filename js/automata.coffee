class Conrand

  nodeArray: null
  canvas: null
  drawingContext: null

  #graphics parameters

  canvasheight: window.innerHeight
  canvaswidth: window.innerWidth

  #game parameters
  
  tickLength: 100
  initialnodes: 200
  adjacentDistance: 36
  vibration: 4
  paused: false

  constructor: ->
    @createCanvas()
    @seed()
    @tick()

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
      node.xPos = node.xPos + ((Math.random() - 0.5) * 2 * @vibration)
      node.yPos = node.yPos + ((Math.random() - 0.5) * 2 * @vibration)
      @rectifyNode node

  evolve: ->

    newArray = []

    if @nodeArray.length == 0
      @seed()

    for node in @nodeArray

      if node.alive is true

        neighbors = @getNeighbors(node, @nodeArray, @adjacentDistance)

        test = true

        for neighbor in neighbors

          if @getNeighbors(neighbor, @nodeArray, @adjacentDistance).length != neighbors.length
          
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

      neighbors = @getNeighbors(node, @nodeArray, @adjacentDistance)

      if neighbors.length == 0 or neighbors.length > 5

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
      @drawConnections(node, @nodeArray, @adjacentDistance)
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
