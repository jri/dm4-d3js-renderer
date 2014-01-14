dm4c.add_plugin("de.deepamehta.d3js-renderer", function() {

    dm4c.load_script("/de.deepamehta.d3js-renderer/script/topicmap_renderers/d3_renderer.js")
    dm4c.load_script("/de.deepamehta.d3js-renderer/script/topicmap_renderers/d3_view.js")
    dm4c.load_script("/de.deepamehta.d3js-renderer/script/vendor/d3.v3.min.js")

    // === Topicmaps Listeners ===

    dm4c.add_listener("topicmap_renderer", function() {
        return new D3Renderer()
    })
})
