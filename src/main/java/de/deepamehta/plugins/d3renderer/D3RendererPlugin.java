package de.deepamehta.plugins.d3renderer;

import de.deepamehta.core.model.CompositeValueModel;
import de.deepamehta.core.osgi.PluginActivator;
import de.deepamehta.core.service.PluginService;
import de.deepamehta.core.service.annotation.ConsumesService;

import de.deepamehta.plugins.topicmaps.TopicmapRenderer;
import de.deepamehta.plugins.topicmaps.service.TopicmapsService;



public class D3RendererPlugin extends PluginActivator implements TopicmapRenderer {

    // *** Hook Implementations ***

    @Override
    @ConsumesService("de.deepamehta.plugins.topicmaps.service.TopicmapsService")
    public void serviceArrived(PluginService service) {
        ((TopicmapsService) service).registerTopicmapRenderer(this);
    }

    // *** TopicmapRenderer Implementation ***

    @Override
    public String getUri() {
        return "dm4.d3js_renderer";
    }

    // ### TODO: copy in DefaultTopicmapRenderer.java
    @Override
    public CompositeValueModel initialTopicmapState() {
        return new CompositeValueModel()
            .put("dm4.topicmaps.translation", new CompositeValueModel()
                .put("dm4.topicmaps.translation_x", 0)
                .put("dm4.topicmaps.translation_y", 0)
            );
    }
}
