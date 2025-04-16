import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category } from '../models/Category';
import { getCategories } from '../services/api';
import { SAMPLE_CATEGORIES } from '../models/Category';

const CategorySection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await getCategories(); // Updated function call
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to sample data if API fails
        setCategories(SAMPLE_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="mb-12">
        <h2 className="text-2xl font-medium mb-8 text-center">Shop Our Most Popular Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse">
              <div className="rounded-lg h-28 mb-2 bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-medium mb-8 text-center">Shop Our Most Popular Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="text-center cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => navigate(`/category/${category.slug}`)}
          >
            <div className="rounded-lg h-28 mb-2 flex items-center justify-center overflow-hidden">
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to sample image if S3 image fails to load
                  const target = e.target as HTMLImageElement;
                  const slug = category.slug;
                  target.src = `https://ext.same-assets.com/2035588304/${
                    slug.includes('cellular') ? '1164789503' :
                    slug.includes('faux-wood') ? '2318792146' :
                    slug.includes('roller') ? '3952014568' :
                    slug.includes('woven') ? '1489675324' :
                    slug.includes('roman') ? '3075921648' :
                    '4152674893'
                  }.jpeg`;
                }}
              />
            </div>
            <p className="text-sm font-medium">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
