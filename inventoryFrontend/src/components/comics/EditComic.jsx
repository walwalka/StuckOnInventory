import React, { useState, useEffect } from 'react';
import Spinner from '../Spinner';
import api from '../../api/client';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import ImageUpload from '../ImageUpload';

const EditComic = () => {
  const [title, setTitle] = useState('');
  const [publisher, setPublisher] = useState('');
  const [series, setSeries] = useState('');
  const [issuenumber, setIssuenumber] = useState('');
  const [publicationyear, setPublicationyear] = useState('');
  const [grade, setGrade] = useState('');
  const [condition, setCondition] = useState('');
  const [variant, setVariant] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [comicData, setComicData] = useState(null);
  const navigate = useNavigate();
  const {id} = useParams();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setLoading(true);
    api
    .get('/comics/'+id)
    .then((response) => {
        setComicData(response.data);
        setTitle(response.data.title);
        setPublisher(response.data.publisher);
        setSeries(response.data.series);
        setIssuenumber(response.data.issuenumber);
        setPublicationyear(response.data.publicationyear);
        setGrade(response.data.grade);
        setCondition(response.data.condition);
        setVariant(response.data.variant || '');
        setDescription(response.data.description || '');
        setQuantity(response.data.quantity || 1);
        setLoading(false);
      }).catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error loading comic', { variant: 'error' });
        console.log(error);
      });
  }, [id])

  const handleEditComic = () => {
    const data = {
      title,
      publisher,
      series,
      issuenumber,
      publicationyear,
      grade,
      condition,
      variant,
      description,
      quantity: parseInt(quantity) || 1
    };
    setLoading(true);
    api
      .put('/comics/'+id, data)
      .then(() => {
        setLoading(false);
        enqueueSnackbar('Comic updated successfully', { variant: 'success' });
        navigate('/comics');
      })
      .catch((error) => {
        setLoading(false);
        enqueueSnackbar('Error', { variant: 'error' });
        console.log(error);
      });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Blurred backdrop overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-md"></div>

      {/* Content container */}
      <div className="flex min-h-full items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <Spinner />
          </div>
        )}

        {/* Modal content - solid background */}
        <div className='flex flex-col border-2 usd-border-green bg-white dark:bg-[#2c2c2c] rounded-xl max-w-2xl w-full max-h-[90vh] shadow-2xl relative my-8 z-10'>
          <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-[#2c2c2c] border-b usd-border-green rounded-t-xl flex-shrink-0">
            <h1 className='text-2xl usd-text-green font-semibold'>Edit Comic</h1>
            <button
              onClick={() => navigate('/comics')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-base font-semibold leading-none"
              aria-label="Close"
            >
              Close
            </button>
          </div>

          <div className="overflow-y-auto px-6 py-6 bg-white dark:bg-[#2c2c2c] rounded-b-xl">
            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Title</label>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Publisher</label>
              <select
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              >
                <option value="Marvel">Marvel</option>
                <option value="DC Comics">DC Comics</option>
                <option value="Image Comics">Image Comics</option>
                <option value="Dark Horse">Dark Horse</option>
                <option value="IDW Publishing">IDW Publishing</option>
                <option value="Boom! Studios">Boom! Studios</option>
                <option value="Valiant">Valiant</option>
                <option value="Archie Comics">Archie Comics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Series</label>
              <input
                type='text'
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Issue Number</label>
              <input
                type='text'
                value={issuenumber}
                onChange={(e) => setIssuenumber(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Publication Year</label>
              <input
                type='text'
                value={publicationyear}
                onChange={(e) => setPublicationyear(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              >
                <option value="CGC 10.0 - Gem Mint">CGC 10.0 - Gem Mint</option>
                <option value="CGC 9.9 - Mint">CGC 9.9 - Mint</option>
                <option value="CGC 9.8 - Near Mint/Mint">CGC 9.8 - Near Mint/Mint</option>
                <option value="CGC 9.6 - Near Mint+">CGC 9.6 - Near Mint+</option>
                <option value="CGC 9.4 - Near Mint">CGC 9.4 - Near Mint</option>
                <option value="CGC 9.2 - Near Mint-">CGC 9.2 - Near Mint-</option>
                <option value="CGC 9.0 - Very Fine/Near Mint">CGC 9.0 - Very Fine/Near Mint</option>
                <option value="CGC 8.5 - Very Fine+">CGC 8.5 - Very Fine+</option>
                <option value="CGC 8.0 - Very Fine">CGC 8.0 - Very Fine</option>
                <option value="CGC 7.5 - Very Fine-">CGC 7.5 - Very Fine-</option>
                <option value="CGC 7.0 - Fine/Very Fine">CGC 7.0 - Fine/Very Fine</option>
                <option value="CGC 6.5 - Fine+">CGC 6.5 - Fine+</option>
                <option value="CGC 6.0 - Fine">CGC 6.0 - Fine</option>
                <option value="Ungraded">Ungraded</option>
              </select>
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              >
                <option value="Mint">Mint</option>
                <option value="Near Mint">Near Mint</option>
                <option value="Very Fine">Very Fine</option>
                <option value="Fine">Fine</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Variant</label>
              <input
                type='text'
                value={variant}
                onChange={(e) => setVariant(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
                rows='4'
              />
            </div>

            <div className='my-4'>
              <label className='text-sm font-semibold usd-text-green mb-2 block'>Quantity</label>
              <input
                type='number'
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className='border-2 border-gray-500 px-4 py-2 w-full rounded text-gray-900 dark:text-gray-100 usd-input'
                min='1'
              />
            </div>

            {/* Image Upload Section */}
            {comicData && (
              <div className='my-4 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <ImageUpload
                  coinId={id}
                  existingImages={{
                    image1: comicData.image1,
                    image2: comicData.image2,
                    image3: comicData.image3
                  }}
                  onUploadSuccess={(updatedComic) => setComicData(updatedComic)}
                  apiEndpoint="/comics"
                />
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                className='flex-1 p-3 usd-btn-green rounded hover:opacity-90 disabled:opacity-60'
                onClick={handleEditComic}
                disabled={loading}
              >
                Save Changes
              </button>
              <button
                className='flex-1 p-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-60'
                onClick={() => navigate('/comics')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditComic;
