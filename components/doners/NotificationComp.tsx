"use client"
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Send, MessageSquare, Bell } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface Template {
    id: number;
    name: string;
    type: 'sms' | 'whatsapp';
    category: string;
    content: string;
    isActive: boolean;
    lastUsed: string;
    usageCount: number;
}

export default function NotificationTemplates() {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        type: 'sms' as 'sms' | 'whatsapp',
        category: '',
        content: '',
        isActive: true,
    });

    const [templates, setTemplates] = useState<Template[]>([
        {
            id: 1,
            name: 'Thank You Message',
            type: 'sms',
            category: 'Thank You',
            content: 'Dear {name}, Thank you for your blood donation at {location}. Your contribution can save lives. - BloodCare Team',
            isActive: true,
            lastUsed: '2 hours ago',
            usageCount: 145,
        },
        {
            id: 2,
            name: 'Report Ready - SMS',
            type: 'sms',
            category: 'Report Ready',
            content: 'Dear {name}, Your blood test report is ready. Download it from: {link} - BloodCare Team',
            isActive: true,
            lastUsed: '3 hours ago',
            usageCount: 89,
        },
        {
            id: 3,
            name: 'Report Ready - WhatsApp',
            type: 'whatsapp',
            category: 'Report Ready',
            content: 'Hello {name}! 🩸\n\nYour blood test report is now available.\n\n📄 Download: {link}\n\nThank you for being a lifesaver!\n\n- BloodCare Team',
            isActive: true,
            lastUsed: '5 hours ago',
            usageCount: 112,
        },
        {
            id: 4,
            name: 'Donation Reminder',
            type: 'whatsapp',
            category: 'Reminder',
            content: 'Hi {name}! 🩸\n\nIt\'s been 3 months since your last donation. You\'re eligible to donate again!\n\nHelp save lives today. Visit us at {location}.\n\n- BloodCare Team',
            isActive: true,
            lastUsed: '1 day ago',
            usageCount: 67,
        },
        {
            id: 5,
            name: 'Blood Camp Update',
            type: 'sms',
            category: 'Camp Update',
            content: 'Blood donation camp at {location} on {date}. Join us to save lives! Register: {link} - BloodCare',
            isActive: true,
            lastUsed: '2 days ago',
            usageCount: 234,
        },
    ]);

    const handleAddTemplate = () => {
        const newTemplate: Template = {
            id: templates.length + 1,
            name: formData.name,
            type: formData.type,
            category: formData.category,
            content: formData.content,
            isActive: formData.isActive,
            lastUsed: 'Never',
            usageCount: 0,
        };
        setTemplates([...templates, newTemplate]);
        setIsAddDialogOpen(false);
        resetForm();
        toast.success('Template added successfully');
    };

    const handleEditTemplate = () => {
        if (selectedTemplate) {
            const updatedTemplates = templates.map(template =>
                template.id === selectedTemplate.id
                    ? { ...template, ...formData }
                    : template
            );
            setTemplates(updatedTemplates);
            setIsEditDialogOpen(false);
            setSelectedTemplate(null);
            resetForm();
            toast.success('Template updated successfully');
        }
    };

    const handleDeleteTemplate = (id: number) => {
        setTemplates(templates.filter(template => template.id !== id));
        toast.success('Template deleted successfully');
    };

    const openEditDialog = (template: Template) => {
        setSelectedTemplate(template);
        setFormData({
            name: template.name,
            type: template.type,
            category: template.category,
            content: template.content,
            isActive: template.isActive,
        });
        setIsEditDialogOpen(true);
    };

    const openSendDialog = (template: Template) => {
        setSelectedTemplate(template);
        setIsSendDialogOpen(true);
    };

    const handleSendNotification = () => {
        toast.success('Notification sent successfully');
        setIsSendDialogOpen(false);
        setSelectedTemplate(null);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'sms',
            category: '',
            content: '',
            isActive: true,
        });
    };

    const smsTemplates = templates.filter(t => t.type === 'sms');
    const whatsappTemplates = templates.filter(t => t.type === 'whatsapp');

    return (
        <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Notification Management"
                        description="Manage SMS and WhatsApp message templates"
                    />
                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Template
                    </Button>
                </div>
                <Separator />


            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-gray-900">{templates.length}</div>
                                <div className="text-gray-500 text-sm">Total Templates</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Bell className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <div className="text-gray-900">{templates.filter(t => t.isActive).length}</div>
                                <div className="text-gray-500 text-sm">Active</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <div className="text-gray-900">{smsTemplates.length}</div>
                                <div className="text-gray-500 text-sm">SMS Templates</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <div className="text-gray-900">{whatsappTemplates.length}</div>
                                <div className="text-gray-500 text-sm">WhatsApp Templates</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Templates Tabs */}
            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Templates</TabsTrigger>
                    <TabsTrigger value="sms">SMS Only</TabsTrigger>
                    <TabsTrigger value="whatsapp">WhatsApp Only</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {templates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                {!template.isActive && <Badge variant="secondary">Inactive</Badge>}
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <Badge variant="outline" className={template.type === 'sms' ? 'border-purple-200 text-purple-600' : 'border-green-200 text-green-600'}>
                                                    {template.type.toUpperCase()}
                                                </Badge>
                                                <span>•</span>
                                                <span>{template.category}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{template.content}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-gray-500">
                                            Used {template.usageCount} times
                                        </div>
                                        <div className="text-gray-400">
                                            Last used: {template.lastUsed}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openSendDialog(template)}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openEditDialog(template)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="sms" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {smsTemplates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                {!template.isActive && <Badge variant="secondary">Inactive</Badge>}
                                            </div>
                                            <CardDescription>{template.category}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700 text-sm">{template.content}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-gray-500">Used {template.usageCount} times</div>
                                        <div className="text-gray-400">Last used: {template.lastUsed}</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openSendDialog(template)}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openEditDialog(template)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="whatsapp" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {whatsappTemplates.map((template) => (
                            <Card key={template.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                {!template.isActive && <Badge variant="secondary">Inactive</Badge>}
                                            </div>
                                            <CardDescription>{template.category}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{template.content}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="text-gray-500">Used {template.usageCount} times</div>
                                        <div className="text-gray-400">Last used: {template.lastUsed}</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => openSendDialog(template)}
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Send Now
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => openEditDialog(template)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleDeleteTemplate(template.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add Template Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Template</DialogTitle>
                        <DialogDescription>Create a new message template for notifications</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="template-name">Template Name</Label>
                                <Input
                                    id="template-name"
                                    placeholder="Enter template name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="template-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="template-category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Thank You">Thank You</SelectItem>
                                    <SelectItem value="Report Ready">Report Ready</SelectItem>
                                    <SelectItem value="Reminder">Reminder</SelectItem>
                                    <SelectItem value="Camp Update">Camp Update</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="template-content">Message Content</Label>
                            <Textarea
                                id="template-content"
                                placeholder="Enter message content. Use {name}, {location}, {date}, {link} as placeholders."
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={6}
                            />
                            <p className="text-xs text-gray-500">
                                Available placeholders: {'{name}'}, {'{location}'}, {'{date}'}, {'{link}'}
                            </p>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="template-active">Active</Label>
                            <Switch
                                id="template-active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddTemplate} className="bg-red-600 hover:bg-red-700">Add Template</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Template Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Template</DialogTitle>
                        <DialogDescription>Update template information</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-template-name">Template Name</Label>
                                <Input
                                    id="edit-template-name"
                                    placeholder="Enter template name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-template-type">Type</Label>
                                <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-template-category">Category</Label>
                            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Thank You">Thank You</SelectItem>
                                    <SelectItem value="Report Ready">Report Ready</SelectItem>
                                    <SelectItem value="Reminder">Reminder</SelectItem>
                                    <SelectItem value="Camp Update">Camp Update</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-template-content">Message Content</Label>
                            <Textarea
                                id="edit-template-content"
                                placeholder="Enter message content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                rows={6}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="edit-template-active">Active</Label>
                            <Switch
                                id="edit-template-active"
                                checked={formData.isActive}
                                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleEditTemplate} className="bg-red-600 hover:bg-red-700">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Send Notification Dialog */}
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Notification</DialogTitle>
                        <DialogDescription>Send this template to selected donors</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Recipients</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose recipient group" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Active Donors</SelectItem>
                                    <SelectItem value="recent">Recent Donors (Last 30 days)</SelectItem>
                                    <SelectItem value="eligible">Eligible for Donation</SelectItem>
                                    <SelectItem value="custom">Custom List</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {selectedTemplate && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{selectedTemplate.content}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSendNotification} className="bg-red-600 hover:bg-red-700">
                            <Send className="w-4 h-4 mr-2" />
                            Send Notification
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
