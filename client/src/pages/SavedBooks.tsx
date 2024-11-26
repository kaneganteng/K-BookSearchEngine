import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { User } from '../models/User';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { useQuery, useMutation } from '@apollo/client';
const SavedBooks = () => {
  // fethc user data using the GET_ME query and assigns it to userData
  const { data } = useQuery(GET_ME);
  const userData: User = data?.me || { username: '', email: '', password: '', savedBooks: [] };
  // prepares the REMOVE_BOOK mutation to delete a book by bookId
  const [removeBook, { error }] = useMutation(REMOVE_BOOK)

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {

      await removeBook({
        variables: {
          bookId: bookId
        }
      })

      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  // 
  if (!removeBook) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks?.length
            ? `Viewing ${userData.savedBooks?.length} saved ${userData.savedBooks?.length === 1 ? 'book' : 'books'
            }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks?.map((book) => {
            return (
              <Col md='4'>
                <Card key={book.bookId} border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                      {error && <div>Something went wrong...</div>}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
