---
name: pytest-testing
description: Generates pytest test suites with fixtures, parametrization, async support, and mocking. Use when the user asks to write tests, add test coverage, or create unit/integration tests for Python code. Triggers on "write tests", "add pytest tests", "create unit tests", "test this module", or "add test coverage".
---

# Pytest Testing

Generate well-structured pytest code following Arrange-Act-Assert, proper fixtures, parametrization, and mocking strategies.

## Workflow

Copy this checklist when writing tests:

```
Test Writing Progress:
- [ ] Read the source code to understand inputs, outputs, and edge cases
- [ ] Check for `if __name__ == "__main__":` blocks — run them to understand behavior
- [ ] Identify dependencies to mock (external APIs, databases, file I/O)
- [ ] Choose mocking approach (see Decision Tree below)
- [ ] Write test file with fixtures, parametrized cases, and edge cases
- [ ] Include any needed conftest.py fixtures
- [ ] Verify tests pass
```

## Core Rules

- Use **only pytest and pytest plugins** — never unittest for test structure
- Follow **Arrange-Act-Assert** in all tests
- All test functions must have **type annotations** on return (`-> None`)
- Tests must be **independent** and runnable in any order
- Patch where the object is **used**, not where it's **defined**
- Include `conftest.py` content when shared fixtures are needed

## Mocking Decision Tree

```
Need to substitute something?
│
├─► Environment variable or simple config?
│   └─► Use monkeypatch
│
├─► Need to verify calls or arguments?
│   └─► Use pytest-mock (mocker)
│
├─► Async function?
│   └─► Use mocker.AsyncMock
│
└─► Not sure?
    └─► Use pytest-mock (most complete)
```

### monkeypatch — Environment and Config

```python
def test_api_uses_correct_key(monkeypatch) -> None:
    monkeypatch.setenv("API_KEY", "test-123")
    client = APIClient()
    assert client.api_key == "test-123"

def test_debug_mode_active(monkeypatch) -> None:
    monkeypatch.setattr("myapp.config.DEBUG", True)
    response = app.get_error_details()
    assert "stack_trace" in response
```

### pytest-mock (mocker) — Call Verification and Simulation

```python
def test_fetches_user_from_api(mocker) -> None:
    mock_get = mocker.patch("myapp.client.requests.get")
    mock_get.return_value.status_code = 200
    mock_get.return_value.json.return_value = {"id": 1, "name": "John"}

    user = fetch_user(1)

    mock_get.assert_called_once_with(
        "https://api.example.com/users/1", timeout=30
    )
    assert user.name == "John"

def test_handles_connection_error(mocker) -> None:
    mock_get = mocker.patch("myapp.client.requests.get")
    mock_get.side_effect = ConnectionError("Network failure")

    result = fetch_data_with_retry()

    assert result is None
    assert mock_get.call_count == 3
```

## Async Testing with pytest-asyncio

Configure in `pyproject.toml`:

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
asyncio_default_fixture_loop_scope = "function"
```

Use `auto` mode (no markers needed). Use `strict` mode only for multi-async-library projects.

### Async Fixtures

```python
import pytest_asyncio

@pytest_asyncio.fixture
async def db_connection():
    conn = await create_connection()
    yield conn
    await conn.close()
```

### Mocking Async Functions

```python
async def test_async_api_call(mocker) -> None:
    mock_fetch = mocker.patch(
        "myapp.client.fetch",
        new_callable=mocker.AsyncMock
    )
    mock_fetch.return_value = {"data": "value"}

    result = await process_data()

    mock_fetch.assert_awaited_once()
    assert result["data"] == "value"
```

### Event Loop Scopes

Use `loop_scope` to share event loops across tests for performance:

```python
# Module-level: all tests share one event loop
pytestmark = pytest.mark.asyncio(loop_scope="module")
```

## Common Fixture Patterns

```python
@pytest.fixture
def mock_database(mocker) -> MagicMock:
    mock = mocker.patch("myapp.db.connection")
    mock.return_value.execute.return_value = []
    return mock

@pytest.fixture
def test_env(monkeypatch) -> None:
    monkeypatch.setenv("ENV", "test")
    monkeypatch.setenv("DEBUG", "false")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")
```

## Anti-Patterns

1. **Over-mocking** — if everything is mocked, nothing real is tested
2. **Missing call verification** — always verify mocks were called as expected
3. **Wrong patch location** — patch where the object is used, not where defined
4. **Using unittest module** — always use pytest-native constructs

## Resources

For advanced mocking patterns (datetime, files, classes, context managers, async iterators, httpx/aiohttp, autospec), decision checklists, and recommended project configuration, see `references/mocking_guide.md`.
