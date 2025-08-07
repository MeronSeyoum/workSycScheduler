// app/componets/form/GeofenceForm.tsx
'use client';

import { useState } from 'react';
import { Button, Form, Input, InputNumber } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Controller } from 'react-hook-form';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  radius: z.number().min(1, {
    message: 'Radius must be at least 1 meter.',
  }),
  latitude: z.number(),
  longitude: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

export default function GeofenceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      radius: 100,
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting geofence:', values);
      // await fetch('/api/geofences', { 
      //   method: 'POST', 
      //   body: JSON.stringify(values) 
      // });
    } catch (error) {
      console.error('Error submitting geofence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit(onSubmit)}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Geofence Name"
            validateStatus={errors.name ? 'error' : ''}
            help={errors.name?.message}
          >
            <Input 
              placeholder="Office Location" 
              {...field} 
              size="large"
            />
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-3 gap-4">
        <Controller
          name="latitude"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Latitude"
              validateStatus={errors.latitude ? 'error' : ''}
              help={errors.latitude?.message}
            >
              <InputNumber
                {...field}
                step={0.000001}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => field.onChange(value)}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="longitude"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Longitude"
              validateStatus={errors.longitude ? 'error' : ''}
              help={errors.longitude?.message}
            >
              <InputNumber
                {...field}
                step={0.000001}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => field.onChange(value)}
              />
            </Form.Item>
          )}
        />

        <Controller
          name="radius"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Radius (meters)"
              validateStatus={errors.radius ? 'error' : ''}
              help={errors.radius?.message}
            >
              <InputNumber
                {...field}
                min={1}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => field.onChange(value)}
              />
            </Form.Item>
          )}
        />
      </div>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={isSubmitting}
          size="large"
        >
          Save Geofence
        </Button>
      </Form.Item>
    </Form>
  );
}