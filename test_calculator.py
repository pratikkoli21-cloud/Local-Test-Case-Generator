
import pytest
from calculator import add, subtract, multiply, divide

def test_add():
    assert add(1, 2) == 3
    assert add(-1, 1) == 0
    with pytest.raises(ValueError):
        add(1, 0)

def test_subtract():
    assert subtract(5, 2) == 3
    assert subtract(-1, 1) == -2
    with pytest.raises(ValueError):
        subtract(0, 1)

def test_multiply():
    assert multiply(4, 5) == 20
    assert multiply(-2, 3) == -6
    assert multiply(0, 10) == 0

def test_divide():
    assert divide(10, 2) == 5.0
    assert divide(-1, -2) == 0.5
    with pytest.raises(ValueError):
        divide(1, 0)

