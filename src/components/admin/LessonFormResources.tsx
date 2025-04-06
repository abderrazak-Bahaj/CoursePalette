import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

interface Resource {
  title: string;
  url: string;
}

interface LessonFormResourcesProps {
  resources: Resource[];
  setResources: (resources: Resource[]) => void;
}

const LessonFormResources = ({
  resources,
  setResources,
}: LessonFormResourcesProps) => {
  const [newResource, setNewResource] = useState<Resource>({
    title: '',
    url: '',
  });

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setResources([...resources, { ...newResource }]);
      setNewResource({ title: '', url: '' });
    }
  };

  const removeResource = (index: number) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Additional Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Resource Title"
            value={newResource.title}
            onChange={(e) =>
              setNewResource({ ...newResource, title: e.target.value })
            }
          />
          <Input
            placeholder="Resource URL"
            value={newResource.url}
            onChange={(e) =>
              setNewResource({ ...newResource, url: e.target.value })
            }
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-2"
          onClick={addResource}
        >
          Add Resource
        </Button>
      </div>

      {resources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Added Resources:</h4>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <Card key={index}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{resource.title}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {resource.url}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(index)}
                  >
                    <X size={16} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonFormResources;
