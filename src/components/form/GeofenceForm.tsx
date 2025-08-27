// app/components/form/GeofenceForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Select, Space, Spin } from 'antd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Controller } from 'react-hook-form';

// Update your zod schema:
const formSchema = z.object({
  client_id: z.number().min(1, {
    message: 'Please select a client.',
  }),
  latitude: z
    .union([z.number(), z.string()])
    .refine(
      (val) => val !== null && val !== undefined && val !== '',
      { message: 'Latitude is required.' }
    )
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine(
      (val) => !isNaN(val),
      { message: 'Latitude must be a valid number.' }
    )
    .refine(
      (val) => val >= -90 && val <= 90,
      { message: 'Latitude must be between -90 and 90.' }
    )
    .refine(
      (val) => /^-?\d+(\.\d{1,6})?$/.test(val.toString()),
      { message: 'Latitude can have up to 6 decimal places.' }
    ),
  longitude: z
    .union([z.number(), z.string()])
    .refine(
      (val) => val !== null && val !== undefined && val !== '',
      { message: 'Longitude is required.' }
    )
    .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
    .refine(
      (val) => !isNaN(val),
      { message: 'Longitude must be a valid number.' }
    )
    .refine(
      (val) => val >= -180 && val <= 180,
      { message: 'Longitude must be between -180 and 180.' }
    )
    .refine(
      (val) => /^-?\d+(\.\d{1,6})?$/.test(val.toString()),
      { message: 'Longitude can have up to 6 decimal places.' }
    ),
  radius_meters: z.number().min(50, {
    message: 'Radius must be at least 50 meters.',
  }).max(5000, {
    message: 'Radius must be at most 5000 meters.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface Client {
  id: number;
  business_name: string;
  email: string;
}

interface GeofenceFormProps {
  initialValues?: any;
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
  clients: Client[];
}

export default function GeofenceForm({ 
  initialValues, 
  onSubmit, 
  loading = false, 
  clients = [] 
}: GeofenceFormProps) {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      client_id: initialValues?.client_id || undefined,
      latitude: initialValues?.latitude || 0,
      longitude: initialValues?.longitude || 0,
      radius_meters: initialValues?.radius_meters || 100,
    },
  });

  useEffect(() => {
    if (initialValues) {
      reset({
        client_id: initialValues.client_id,
        latitude: initialValues.latitude,
        longitude: initialValues.longitude,
        radius_meters: initialValues.radius_meters,
      });
    }
  }, [initialValues, reset]);

  const onFormSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      if (!initialValues) {
        reset();
      }
    } catch (error) {
      console.error('Error submitting geofence:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='px-6'>
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit(onFormSubmit)}
      className="space-y-6 px-4"
      initialValues={initialValues}
    >
      <Controller
        name="client_id"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Client"
            validateStatus={errors.client_id ? 'error' : ''}
            help={errors.client_id?.message}
            required
          >
            <Select
              placeholder="Select a client"
              {...field}
              size="large"
              loading={loading}
              onChange={(value) => field.onChange(value)}
              value={field.value}
              options={clients.map(client => ({
                value: client.id,
                label: client.business_name,
              }))}
            />
          </Form.Item>
        )}
      />

      <div className="grid grid-cols-2 gap-4 ">
        <Controller
          name="latitude"
          control={control}
          render={({ field }) => (
            <Form.Item
              label="Latitude"
              validateStatus={errors.latitude ? 'error' : ''}
              help={errors.latitude?.message}
              required
            >
              <InputNumber
                {...field}
                step={0.000001}
                precision={6}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => field.onChange(value)}
                value={field.value}
                placeholder="e.g., 40.7128"
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
              required
            >
              <InputNumber
                {...field}
                step={0.000001}
                precision={6}
                style={{ width: '100%' }}
                size="large"
                onChange={(value) => field.onChange(value)}
                value={field.value}
                placeholder="e.g., -74.0060"
              />
            </Form.Item>
          )}
        />
      </div>

      <Controller
        name="radius_meters"
        control={control}
        render={({ field }) => (
          <Form.Item
            label="Radius (meters)"
            validateStatus={errors.radius_meters ? 'error' : ''}
            help={errors.radius_meters?.message}
            required
          >
            <InputNumber
              {...field}
              min={50}
              max={5000}
              style={{ width: '100%' }}
              size="large"
              onChange={(value) => field.onChange(value)}
              value={field.value}
              placeholder="e.g., 100"
              addonAfter="m"
            />
          </Form.Item>
        )}
      />

      <Form.Item>
         <Space>
        <Button 
           style={{ backgroundColor: "#0F6973", color: "white" }}
          htmlType="submit" 
          loading={isSubmitting || loading}
          size="large"
          block
        >
          {initialValues ? 'Update Geofence' : 'Create Geofence'}
        </Button>
         <Button htmlType="button"  size="large" onClick={() => form.resetFields()}>
                    Reset
                  </Button></Space>
      </Form.Item>
    </Form>
    </div>
  );
}