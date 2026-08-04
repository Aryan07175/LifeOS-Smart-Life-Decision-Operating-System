/**
 * TemplatePicker — Bottom sheet modal for selecting a decision template.
 */

import React from 'react';
import { View, Text, Modal, FlatList } from 'react-native';
import { PressableScale } from '@/components/ui';
import { Ionicons } from '@expo/vector-icons';
import { useTemplates } from '@/hooks/useDecisions';
import { getCategoryColor } from '@/utils/helpers';
import type { Template } from '@/services/decisionService';

type TemplatePickerProps = {
    visible: boolean;
    onClose: () => void;
    onSelect: (template: Template) => void;
};

export const TemplatePicker: React.FC<TemplatePickerProps> = ({ visible, onClose, onSelect }) => {
    const { data: templates = [], isLoading } = useTemplates();

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
                <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingTop: 16 }}>
                    {/* Handle */}
                    <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 16 }}>
                        <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 18, color: '#111827' }}>Choose a Template</Text>
                        <PressableScale onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </PressableScale>
                    </View>

                    {isLoading ? (
                        <View style={{ padding: 24, gap: 12 }}>
                            {[1, 2, 3].map((i) => (
                                <View key={i} style={{ backgroundColor: '#F3F4F6', borderRadius: 14, height: 72 }} />
                            ))}
                        </View>
                    ) : templates.length === 0 ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <Ionicons name="document-outline" size={32} color="#C7C4D8" />
                            <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#6B7280', marginTop: 12 }}>
                                No templates available yet
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={templates}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                            renderItem={({ item }) => (
                                <PressableScale
                                    onPress={() => { onSelect(item); onClose(); }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: 14,
                                        padding: 16,
                                        marginBottom: 10,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 12,
                                            backgroundColor: getCategoryColor(item.category) + '18',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginRight: 14,
                                        }}
                                    >
                                        <Ionicons name="document-text" size={18} color={getCategoryColor(item.category)} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 15, color: '#111827' }}>{item.name}</Text>
                                        {item.description ? (
                                            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: '#6B7280', marginTop: 2 }} numberOfLines={1}>
                                                {item.description}
                                            </Text>
                                        ) : null}
                                    </View>
                                    <View style={{ backgroundColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                        <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: '#6B7280', textTransform: 'capitalize' }}>{item.category}</Text>
                                    </View>
                                </PressableScale>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};
