import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './style.css'

const items = [
  {
    id: 14864,
    name: "Recurring Item",
    category: null,
  },
  {
    id: 14865,
    name: "Jasinthe Bracelet",
    category: { id: 14866, name: "Bracelets" },
  },
  {
    id: 14867,
    name: "Jasinthe Bracelet",
    category: { id: 14866, name: "Bracelets" },
  },
  {
    id: 14870,
    name: "Inspire Bracelet",
    category: { id: 14866, name: "Bracelets" },
  },
  {
    id: 14868,
    name: "Zero amount item with questions",
    category: null,
  },
  {
    id: 14872,
    name: "Normal item with questions",
    category: null,
  },
  {
    id: 14873,
    name: "Normal item",
    category: null,
  },
];

const groupByCategory = (items) => {
  const grouped = items.reduce((acc, item) => {
    const category = item.category ? item.category.name : "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, items]) => ({ category, items }));
};

const ItemForm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [output, setOutput] = useState(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedItems = groupByCategory(filteredItems);

  const handleSubmit = (values) => {
    const selectedItems = values.items;
    const appliedTo = values.applied_to === 'all' ? 'all' : 'some';
    const taxName = values.taxName;
    const taxRate = values.taxRate / 100;

    const outputData = {
      'applicable items': selectedItems,
      'applied to': appliedTo,
      'name': taxName,
      'rate': taxRate,
    };

    console.log(outputData);
    setOutput(outputData);
  };

  const validationSchema = Yup.object({
    taxName: Yup.string().required('Tax Name is required'),
    taxRate: Yup.number().required('Tax Rate is required').positive('Tax Rate must be positive').integer('Tax Rate must be an integer'),
    items: Yup.array().min(1, 'You must select at least one item').required('You must select at least one item'),
  });

  return (
    <div className='container'>
      <Formik
        initialValues={{ taxName: '', taxRate: '', applied_to: 'specific', items: [] }}
        onSubmit={handleSubmit}
        validationSchema={validationSchema}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div>
              <label htmlFor="taxName" className='col-12 pb-2 pt-2 h2' >Add Tax</label>
           <div className="row">
           <div className="taxName col-8">
              <Field name="taxName" placeholder="Tax Name" className="w-100" />
              <ErrorMessage name="taxName" className='error' component="div" style={{ color: 'red' }} />
              </div>
              <div className="taxRate col-2">
              <Field name="taxRate" placeholder="Tax Rate" type="number"  />
              <ErrorMessage name="taxRate" component="div" className='error' style={{ color: 'red' }} />%
              </div>
           </div>
              
            </div>
            <div>
              <label className='col-12'> 
                <Field type="radio" name="applied_to" value="all" />
                Apply to all items in collection
              </label>
              <label className='col-12'>
                <Field type="radio" name="applied_to" value="specific" />
                Apply to specific items
              </label>
            </div>
            <hr class="bg-danger border-2 border-top border-danger" />
            <div>
              <input
                type="text"
                placeholder="Search Items"
                value={searchTerm}
                onChange={handleSearchChange}
                className='mb-3'
              />
            </div>
            {groupedItems.map(({ category, items }) => (
              <div key={category}>
                <div style={{ background: '#eeeeee', padding: '5px' }}>
                  <label>
                    <Field
                      type="checkbox"
                      name="category"
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const newItems = items.map(item => item.id);
                        if (checked) {
                          setFieldValue(
                            'items',
                            [...new Set([...values.items, ...newItems])]
                          );
                        } else {
                          setFieldValue(
                            'items',
                            values.items.filter(itemId => !newItems.includes(itemId))
                          );
                        }
                      }}
                      checked={items.every(item => values.items.includes(item.id))}
                    />
                    {category}
                  </label>
                </div>
                {items.map(item => (
                  <div key={item.id} style={{ paddingLeft: '20px' }}>
                    <label>
                      <Field
                        type="checkbox"
                        name="items"
                        value={item.id}
                        checked={values.items.includes(item.id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            setFieldValue('items', [...values.items, item.id]);
                          } else {
                            setFieldValue('items', values.items.filter(id => id !== item.id));
                          }
                        }}
                      />
                      {item.name}
                    </label>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ color: 'red' }}>
              <ErrorMessage name="items" />
            </div>
            <hr class="bg-danger border-2 border-top border-danger" />
            <button className='btn btn-outline-success mb-4' type="submit">Apply tax to {values.items.length} item(s)</button>
          </Form>
        )}
      </Formik>
      {output && (
        <div className="output">
          <h1 className="heading">Output</h1>
          <h6>Applicable Items: {output['applicable items'].join(', ')}</h6>
          <h6>Applied To: {output['applied to']}</h6>
          <h6>Name: {output['name']}</h6>
          <h6>Rate: {output['rate']}</h6>
        </div>
      )}
    </div>
  );
};

export default ItemForm;
