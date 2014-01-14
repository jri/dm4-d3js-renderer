/**
 * A topicmap renderer that displays a geo map in the background. The rendering is based on OpenLayers library.
 *
 * OpenLayers specifics are encapsulated. The caller must not know about OpenLayers API usage.
 */
function D3Renderer() {

    // ------------------------------------------------------------------------------------------------ Constructor Code

    js.extend(this, TopicmapRenderer)

    this.dom = $("<div>")

    // Viewmodel
    var topicmap    // the topicmap currently rendered (a TopicmapViewmodel). Initialized by display_topicmap().

    // View
    var d3_view = new D3View()

    // ------------------------------------------------------------------------------------------------------ Public API



    // === TopicmapRenderer Implementation ===

    this.get_info = function() {
        return {
            uri: "dm4.d3js_renderer",
            name: "Topicmap (with force)"
        }
    }

    // ---

    this.load_topicmap = function(topicmap_id, config) {
        return new TopicmapViewmodel(topicmap_id, config)
    }

    this.display_topicmap = function(topicmap_viewmodel, no_history_update) {
        topicmap = topicmap_viewmodel
        d3_view.display_topicmap(topicmap)
    }



    // === Left SplitPanel Component Implementation ===

    this.init = function() {
        d3_view.init()
    }

    /**
     * Called in 3 situations:
     * 1) Initialization: the topicmap renderer is added to the split panel.
     * 2) The user resizes the main window.
     * 3) The user moves the split panel's slider.
     */
    this.resize = function(size) {
        d3_view.resize(size)
    }
}
