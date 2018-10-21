<template lang='pug'>

  v-app#App

    v-layout.layout-1(align-center justify-center): #atom
      .electrosphere(
        v-for  = '(layer, i) in reversedArr(diagram)'
        :class = `[
          'layer-' + (7 - i),
          {
            'empty': !reversedArr(layers)[i]
          }
        ]`
        :style = `{
         '--size': 100 - i * 10 + '%',
         '--base': reversedArr(layers)[i]
        }`
      )
        .electron(
          v-for  = '(electrons, j) in reversedArr(layers)[i]'
          :style = "{'--index': j}"
        )
      the-mask#element-search(mask='Aa' v-model='search')
      label(for='element-search')
        .nucleus(:class="{'match-error': electrons < 1}")
          h2.element-initials {{ search }}
          sup {{ electrons | electronsIndicator }}

    v-layout.layout-2(align-center column)
      v-slider.electrons-slider(
        v-model='electronsSlide'
        thumb-label
        min='1'
        max='118'
        color='teal accent-4'
        append-icon='mdi-chevron-right'
        prepend-icon='mdi-chevron-left'
        @input='updateElectrons(), updateElementName()'
        @click:append='increment(1), updateElementName()'
        @click:prepend='increment(-1), updateElementName()'
      )


      .notation-display(
        :class = `{
          'show-full-notation': showFullNotation
        }`
        @click = 'showFullNotation = !showFullNotation'
      )
        span(
          v-for  = 'item, i in notation'
          :class = `{
            'truncate': typeof item === 'string',
            'middle': notation.length > 5 && 2 < i && i < notation.length - 3
          }`
          v-show = 'electrons > 0'
        )
          span(v-if="typeof item === 'object'") {{ item.location }}
            sup {{ item.electrons }}
          span(v-else)
            v-icon(color='teal accent-4') mdi-dots-horizontal

        span.input-error(v-if = '!notation.length') Invalid input



    v-toolbar.px-4(flat fixed color='transparent')

      v-spacer

      v-btn(flat round color='teal lighten-1' @click='infoDialog = true')
        v-icon mdi-information-variant

      v-tooltip(bottom)
        v-btn(flat fab color='teal lighten-1' slot='activator' :disabled='electrons < 1' @click='googleSearchElement')
          v-icon mdi-magnify
        span Seach on Google



    v-dialog(scrollable max-width='500px' v-model='infoDialog')
      v-card(max-width='500px')

        v-card-title.pt-4
          v-layout(row no-wrap)

            img(height='32' src='public/icon.svg')

            v-divider.ml-3.mr-2(vertical)

            .headline.text-truncate.teal--text.text--accent-4 {{ 'Electron Builder ' }}
              sup e
                sup -


        v-card-text
          v-layout(row wrap)

            v-flex.pl-2(xs12)
              .caption Help

            v-flex.py-2(xs12 d-flex align-center v-for='tip, index in help' :key='index')
                .px-2.headline.teal--text {{ index + 1 }}

                .pl-3.body-1 {{ tip }}


        v-card-actions.px-3
          v-spacer
          v-btn.px-4(flat round color='teal accent-4' @click='infoDialog = false') Close
  //-
</template>



<script lang='coffee'>

  export default
    data: ->
      electrons: 0
      electronsSlide: 1
      diagram: []
      sequence: {}
      notation: []
      showFullNotation: false
      layers: []
      search: 'H'
      elements: ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm', 'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og']

      infoDialog: false
      help: [
        'You can select any element through the slider by its atomic number, or by clicking on the nucleus and typing its initials.'
        'written below the slider there is the simple notation of the distribution of the electrons, clicking on it expands the complete notation.'
        'the magnifying glass button does a google search for more information of the selected element, if you have any input error it will be disabled.'
      ]


    methods:
      buildDiagram: ->
        for i in [0..6]
          length = - Math.abs(i - 3.5) + 4.5
          @diagram.push Array(length).fill 0


      generateSequence: ->
        [posX, posY] = [[], []]

        for x in [0..30]
          a = 3 - x % 4
          b = x - 3 * Math.round x / 4
          l = x / 6.7

          if a <= l then posX.push a
          if b >= l then posY.push b
        @sequence = { posX, posY }


      distributeElectrons: ->
        count = if @electrons >= 0 then @electrons else 0

        for _, i in @sequence.posX
          { posX, posY } = @sequence
          [ x, y ] = [ posX[i], posY[i] ]
          count -= @diagram[y][x] = if count < 2 + 4 * x then count else 2 + 4 * x


      writeNotation: ->
        sublayers = ['s', 'p', 'd', 'f']
        @notation.length = 0

        for _, i in @sequence.posX
          { posX, posY } = @sequence
          [ x, y ] = [ posX[i], posY[i] ]

          if @diagram[y][x] then @notation.push
            location: (y + 1) + sublayers[x]
            electrons: @diagram[y][x]

        if @notation.length > 5 then @notation.splice 2, 0, '...'


      getLayersElectrons: ->
        @layers.length = 0
        for layer in @diagram then @layers.push layer.reduce (a, b) => a + b


      increment: (value) ->
        if @electrons > 1 and value < 0 or @electrons < 118 and value > 0
          @electrons += value


      updateElectrons: ->
        @electrons = @electronsSlide


      updateElementName: ->
        @search = @elements[@electrons]


      reversedArr: (arr) ->
        for i in [arr.length - 1..0] by -1 then arr[i]


      googleSearchElement: ->
        name = @elements[@electrons]
        window.open "https://www.google.com.br/search?q=element+#{name}+#{@electrons}+periodic+table"


    watch:
      electrons: ->
        @distributeElectrons()
        @writeNotation()
        @getLayersElectrons()
        if @electrons > 0 then @electronsSlide = @electrons

      search: ->
        @electrons = @elements.indexOf(@search)


    filters:
      electronsIndicator: (val) ->
        if val > 0 then val else '?'


    beforeMount: ->
      @buildDiagram()
      @generateSequence()


    mounted: ->
      @electrons = 1

</script>



<style lang='sass'>

  \:root
    --main-color: #00BFA5

  html
    overflow: hidden

  body, #App
    height: 100vh
    background: #F6F8F8
    color: #37474f
    font-family: 'Comfortaa', cursive
    font-weight: 300
    display: flex
    flex-direction: column
    justify-content: center
    align-items: center
    user-select: none
    cursor: default

  #App
    max-height: 500px

    .application--wrap
      min-height: auto

    .layout-1
      flex-grow: 3

    .layout-2
      flex-grow: 1

  #atom
    width: 300px
    height: 300px
    margin-top: 20%
    flex-shrink: 0

    .electrosphere
      width: var(--size)
      height: var(--size)
      margin-top: calc((var(--size) + 5.3%) * -1)
      margin-left: calc((100% - var(--size)) / 2)
      border: 1px solid #CCC
      border-radius: 50%
      transition: .3s

      &.layer-7
        margin: 0

      &.layer-1.empty
        visibility: visible
        opacity: 1

      &.empty
        visibility: hidden
        opacity: 0

    .electron
      width: 100%
      height: 100%
      margin-top: -100%
      transform: rotate(calc(360deg * var(--index) / var(--base)))
      transition: .3s

      &:first-child
        margin-top: 0

      &::before
        content: ''
        margin: -3px 0 0 calc(50% - 1px)
        outline: 3px solid #F6F8F8
        padding: 3px
        border-radius: 50%
        background: var(--main-color)
        position: absolute



    #element-search
      position: absolute
      opacity: 0
      top: -3%

      &:focus + label .element-initials
        animation: test 1s step-end infinite

        @keyframes test
          from
            border-right: 1px solid #FFF
          50%
            border-right: 1px solid transparent
          to
            border-right: 1px solid #fff

    .nucleus
      width: 20%
      height: 20%
      margin: -30% 0 0 40%
      background: var(--main-color)
      border-radius: 50%
      color: #FFF
      display: flex
      justify-content: center
      align-items: center
      cursor: text
      z-index: 99
      position: relative

      &.match-error
        background: #FFEB3B

      .element-initials
        min-height: 19px
        text-transform: capitalize



  .electrons-slider
    margin-top: 0
    flex: none

    .v-messages
      display: none



  .notation-display
    width: 260px
    height: 54px
    margin: 0
    font-weight: 600
    display: flex
    flex-wrap: wrap
    justify-content: space-evenly
    cursor: pointer

    &.show-full-notation
      .middle
        display: inline-block

      .truncate
        display: none

    *
      width: 36px
      text-align: center

    .middle
      color: var(--main-color)
      display: none

    .truncate
      margin-top: -3px
      font-size: 1.3em



  @media only screen and (max-width: 425px)
    #atom
      width: 250px
      height: 250px

      .nucleus
        font-size: .7em

      .electron::before
        margin: -3px 0 0 calc(50% - 3px)
        padding: 2.5px

</style>
